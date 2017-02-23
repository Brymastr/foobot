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
  mongoose.connect(config.db);
  mongoose.connection.on('open', () => {
    log.info(`Connected to mongodb at: ${config.db}`);
    resolve();
  });
});

/**
 * Connect to the rabbitmq service
 * 
 * Each subscriber will then open channels and assert specific queues
 */
const queuePromise = new Promise((resolve, reject) => {
  rabbit.connect(config.rabbit_url)
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
 * Create the config.json file based on environment variables
 */
const configPromise = Promise.resolve(require('./init')(config));

/**
 * Turn the results of the above promises into an object to be
 * forwarded to the executing process
 */
const createResultObject = results => new Promise(resolve => {
  resolve({
    queueConnection: results[1],
    classifier: results[2],
    config: results[3]
  });
});

const promises = [
  databasePromise,
  queuePromise,
  classifierPromise,
  configPromise
];

module.exports = new Promise((resolve, reject) => {
  Promise.all(promises)
    .then(createResultObject)
    .then(resolve)
    .catch(reject);
});