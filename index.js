// Require libraries
const 
  mongoose = require('mongoose'),
  express = require('express'),
  bodyParser = require('body-parser'),
  processing = require('./processing'),
  services = require('./services'),
  methodOverride = require('method-override'),
  log = require('./logger'),
  natural = require('natural'),
  ngrok = require('ngrok'),
  config = require('./config.json'),
  init = require('./init')(config),
  passport = require('passport'),
  schedule = require('node-schedule'),
  async = require('async'),
  strings = require('./strings'),
  rabbit = require('amqplib');

mongoose.Promise = Promise;

// Express setup
var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json({type:'application/json'}));
app.use(methodOverride());
app.use(passport.initialize());

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

// Configurations
ngrok.connect(config.port, (err, url) => {
  config.url = url;
  if(process.env.FOOBOT_URL) ngrok.disconnect(url);

  log.logLevel = config.log_level;
  log.debug(`Route token: ${config.route_token}`);
  require('./passport')(passport);

  // Routes + classifier
  natural.BayesClassifier.load('classifier.json', null, (err, classifier) => { 
    let routes = require('./routes')(passport, classifier);
    app.use('/', routes);
  });

  // MongoDB connection
  mongoose.connect(config.db);
  mongoose.connection.on('open', () => {
    log.info(`Connected to mongodb at: ${config.db}`);
  });

  // Start server
  app.listen(config.port);

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

  // Skype

  // Slack

  // Messenger

});
