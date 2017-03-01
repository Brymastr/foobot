const 
  promisify = require('es6-promisify'),
  rabbit = require('amqplib'),
  config = require('./config.json'),
  mongoose = require('mongoose'),
  log = require('./logger'),
  loadClassifier = promisify(require('natural').BayesClassifier.load);

require('./init')(config);
mongoose.Promise = Promise;

/**
 * Connect to the database.
 * 
 * This connection only needs to be established once upon process creation 
 * and then it can be used in subsequent modules along the execution chain
 */
const databasePromise = new Promise(resolve => {
  mongoose.connect(config.db);
  mongoose.connection.on('open', () => {
    log.info(`Connected to mongodb at: ${config.db}`);
    resolve();
  });
});

/**
 * Create the exchange
 * 
 * This has to be here because the config isn't initialized 
 * until after this promise is fulfilled
 */
const exchangePromise = new Promise((resolve, reject) => {
  rabbit.connect(config.rabbit.queue).then(connection => {
    return connection.createChannel()
      .then(channel => {
        return channel.assertExchange(config.rabbit.exchange_name, 'topic')
          .then(ok => channel.close());
      })
      .then(() => connection.close());
  }).then(resolve).catch(reject);
});

/**
 * Connect to the rabbitmq service
 * 
 * Each subscriber will then open channels and assert specific queues
 */
const queuePromise = new Promise((resolve, reject) => {
  rabbit.connect(config.rabbit.queue)
    .then(resolve)
    .catch(reject);
});

/**
 * Load the classifier json from disk
 */
const classifierPromise = new Promise((resolve, reject) => {
  loadClassifier('classifier.json', null)
    .then(resolve)
    .catch(reject);
});

/**
 * Turn the results of the above promises into an object to be
 * forwarded to the executing process
 */
const createResultObject = results => new Promise(resolve => {
  resolve({
    queueConnection: results[1],
    classifier: results[2],
    config
  });
});

const promises = [
  databasePromise,
  queuePromise,
  classifierPromise
];

module.exports = new Promise((resolve, reject) => {
  exchangePromise.then(() => {
    Promise.all(promises)
      .then(createResultObject)
      .then(resolve)
      .catch(reject);
    });
  });