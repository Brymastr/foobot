var bot = require('./telegramBotApi');
var processing = require('./processing');
var express = require('express');
var log = require('./logger');


module.exports = function(routeToken, classifier) {
  var router = express.Router();

  // Routes
  router.post('/send', function(req, res) {
    bot.sendMessage(req.body, function() {
      res.send('message sent: ' + req.body.message);
    });
  });

  router.post('/webhook/:token', function(req, res) {
    processing.processUpdate(req.body, classifier, (message) => {
      if(req.params.token != routeToken) {
        log.info('Invalid route token');
        res.sendStatus(401);
      } else if(message != undefined) {
        log.debug('Response: ' + message);
        bot.sendMessage(message, () => res.sendStatus(200));
      } else {
        res.sendStatus(200);
      }
    });
  });
  
  return router;
};