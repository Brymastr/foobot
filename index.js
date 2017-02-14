// Require libraries
const 
  promisify = require('es6-promisify'),
  mongoose = require('mongoose'),
  express = require('express'),
  bodyParser = require('body-parser'),
  processing = require('./processing'),
  services = require('./services'),
  methodOverride = require('method-override'),
  log = require('./logger'),
  loadClassifier = promisify(require('natural').BayesClassifier.load, {multiArgs: true}),
  ngrok = promisify(require('ngrok').connect, {multiArgs: true}),
  config = require('./config.json'),
  init = require('./init')(config),
  passport = require('passport'),
  schedule = require('node-schedule'),
  async = require('async'),
  strings = require('./strings');

mongoose.Promise = Promise;

// Express setup
var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json({type:'application/json'}));
app.use(methodOverride());
app.use(passport.initialize());
require('./passport')(passport);
log.logLevel = config.log_level;
log.debug(`Route token: ${config.route_token}`);

// Logging middleware
app.use('*', (req, res, next) => {
  log.info(`${req.method}: ${req.baseUrl}`);
  next();
});

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const queuePromise = new Promise((resolve, reject) => {
  rabbit.connect(config.rabbit.url)
    .then(connection => connection.createChannel())
    .then(channel => channel.assertExchange('foobot')
    .then(resolve));
});

const databasePromise = new Promise((resolve, reject) => {
  mongoose.connect(config.db);
  mongoose.connection.on('open', () => {
    log.info(`Connected to mongodb at: ${config.db}`);
    resolve();
  });
});

const classifierPromise = new Promise((resolve, reject) => {
  loadClassifier('classifier.json', null, (err, classifier) => { 
    err ? reject(err) : resolve(classifier);
  });
});

var promises = [,
  queuePromise,
  classifierPromise,
  databasePromise
];
  
Promise.all(promises).then(result => {
  let channel = result[0];
  let classifier = result[1];
  app.use('/', require('./routes')(passport, classifier, channel));

  if(process.env.FOOBOT_URL) 
    ngrok(config.port).then(url => config.url = url[1]);
  
  app.listen(config.port);
});

// TODO: New route to request url

// Telegram
if(config.telegram)
  services.telegram.setWebhook();

// Twitter
let rule = new schedule.RecurrenceRule();
rule.hour = 10;
rule.minute = 30;
schedule.scheduleJob(rule, () => {
  async.retry({
    times: 5,
    interval: 2000,
    errorFilter: err => err === 187
  }, (cb, results) => {
    services.twitter.sendTweet(strings.$('tweet'))
      .then(tweet => {
        log.info(`Tweet sent: ${tweet}`);
        cb(tweet);
      })
      .catch(err => cb(new Error(err)));
  });
});