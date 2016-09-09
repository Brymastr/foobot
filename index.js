// Require libraries
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const processing = require('./processing');
const bot = require('./telegramBotApi');
const methodOverride = require('method-override');
const uuid = require('node-uuid');
const log = require('./logger');
const natural = require('natural');  

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

var getUpdatesJob = _classifier => {
  bot.getUpdates(50, 5, -5, updates => {
    updates.forEach(update => {
      processing.processUpdate(update, _classifier, (response) => {
        log.debug('Topic: ' + response.topic);
        // log.debug('SEND: ' + response)
        bot.sendMessage(response, () => {
          // Send a getUpdates with higher offset to mark all as read
          bot.getUpdates(0, 1, update.update_id + 1, () => {});
        });
      });
    });
  });
};

// Set up webhook or use getUpdates()
if(url) {
  bot.setWebhook(`${url}/${routeToken}`, '/etc/nginx/certs/foobot.dorsaydevelopment.ca.crt');
} else {
  bot.setWebhook();
  natural.BayesClassifier.load('classifier.json', null, function(err, _classifier) { 
    getUpdatesJob(_classifier);
    schedule.scheduleJob('0 * * * * *', function() {
      getUpdatesJob(_classifier);
    });
    log.info('getUpdates()');
  });
}