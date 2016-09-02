var bot = require('./telegramBotApi');
var processing = require('./processing');
var express = require('express');
var log = require('./logger');

module.exports = function(app) {
  var router = express.Router();
  // Routes
  router.post('/send', function(req, res, next) {
    bot.sendMessage(req.body.message, req.body.chat_id, function() {
      res.send('message sent: ' + req.body.message);
    });
  });

  router.post('/webhook/:token', function(req, res) {
    if(processing.isTrigger(req.body.message.text))
      processing.processMessage(req.body.message, () => res.send(200));
    else
      res.send(200);
  });

  router.get('/updates', function(req, res) {
    console.log('getUpdates()');
    bot.getUpdates(0, 10, null, function(updates) {
      res.json(updates);
    });
  });
  
  return router;
};