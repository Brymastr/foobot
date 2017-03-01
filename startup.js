const 
  promisify = require('es6-promisify'),
  rabbit = require('amqplib'),
  config = require('./config.json'),
  mongoose = require('mongoose'),
  log = require('./logger'),
  loadClassifier = promisify(require('natural').BayesClassifier.load);

mongoose.Promise = Promise;

/**
 * Connect to the database.
 * 
 * This connection only needs to be established once upon process creation 
 * and then it can be used in subsequent modules along the execution chain
 */
const databasePromise = new Promise(resolve => {
  mongoose.connect(config.db)
    .then(resolve)
    .catch(err => {throw new Error(err)});
});

/**
 * Load the classifier json from disk
 */
const classifierPromise = loadClassifier('classifier.json', null);
    
/**
 * Connect to the rabbitmq service
 * 
 * Each subscriber will then open channels and assert specific queues
 */
const queueConnectionPromise = rabbit.connect(config.rabbit.queue);


/**
 * Create the exchange
 * 
 */
const exchangePromise = conn => {
  return new Promise((resolve, reject) => {
    conn.createChannel().then(channel => {
      return channel.assertExchange(config.rabbit.exchange_name, 'topic')
        .then(ok => channel.close());
    })
    .then(resolve).catch(err => {throw new Error('eeeerrror')});
  });
};

/**
 * Turn the results of the above promises into an object to be
 * forwarded to the executing process
 */
const createResultObject = results => {
  return Promise.resolve({
    classifier: results[0],
    queueConnection: results[3]
  });
};

module.exports = new Promise((resolve, reject) => {
  retry(queueConnectionPromise, 'connect to rabbit at ' + config.rabbit.queue, 10, 15000).then(conn => {
    const promises = [
      retry(classifierPromise, 'load classifier'),
      retry(databasePromise, 'connect to mongoose'),
      retry(exchangePromise(conn), 'create rabbit exchange')
    ];
    
    Promise.all(promises)
      .then(results => {
        results.push(conn);
        return createResultObject(results)
      })
      .then(resolve)
      .catch(reject);
  });
});

/**
 * Retry a promise
 */
function retry(promise, message, attempts = 5, interval = 500) {
  return new Promise((resolve, reject) => {
    promise.then(resolve).catch(err => {
      console.log(err)
      if(attempts === 0) throw new Error('Max retries reached for ' + message);
      else setTimeout(() => {
        console.log('retry ' + message);
        return retry(promise, message, --attempts, interval).then(resolve);
      }, interval);
    });
  });
}