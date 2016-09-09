// Require libraries
var mongoose = require('mongoose');
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var schedule = require('node-schedule');
var processing = require('./processing');
var bot = require('./telegramBotApi');
var methodOverride = require('method-override');
var uuid = require('node-uuid');
var log = require('./logger');
var natural = require('natural');  

// App setup
var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json({type:'application/json'}));
app.use(methodOverride());

// Configurations
const db = process.env.FOOBOT_DB_CONN || 'mongodb://localhost/foobot';
const url = process.env.FOOBOT_URL;
const port = process.env.FOOBOT_PORT || 9000;
log.logLevel = process.env.FOOBOT_LOG_LEVEL || 'debug';
const routeToken = (url != null) ? uuid.v4() : 'token';
log.info('Route token => ' + routeToken);
let classifier;

// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Logging middleware
app.use('*', function(req, res, next) {
  log.info(req.method + ': ' + req.baseUrl);
  log.debug(req.body);
  next();
});

// Routes + classifier
natural.BayesClassifier.load('classifier.json', null, function(err, classifier) {  
  log.debug('classifier loaded from classifier.json');
  let routes = require('./routes')(routeToken, classifier);
  app.use('', routes);
});

// Start server
http.createServer(app).listen(port, function() {
  log.info("server listening on port " + port);
});

var getUpdatesJob = function(_classifier) {
  bot.getUpdates(30, 5, -5, function(updates) {
    updates.forEach(function(update) {
      var message = update;
      console.log('message: ' + update.text + '  ' + (update.chat_name || update.chat_id));      
      if(update.text != undefined) {
        bot.sendMessage(processing.processUpdate(update, _classifier, () => res.sendStatus(200)), null, update.chat_id, () => {
          // Send a getUpdates with higher offset to mark all as read
          bot.getUpdates(0, 1, update.update_id + 1, () => {});
        });
      }
    });
  });
};

// Set up webhook or use getUpdates()
if(url) {
  bot.setWebhook(`${url}/${routeToken}`, '/etc/nginx/certs/foobot.dorsaydevelopment.ca.crt');
} else {
  bot.setWebhook();
  schedule.scheduleJob('0 * * * * *', function() {
    natural.BayesClassifier.load('classifier.json', null, function(err, classifier) {  
      getUpdatesJob(classifier);
    });
    log.info('getUpdates()');
  });
}