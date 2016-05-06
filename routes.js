var bot = require('./telegramBotApi');
var processing = require('./processing');
var express = require('express');

module.exports = function(app) {
  var router = express.Router();
  // Routes
  router.post('/send', function(req, res, next) {
    bot.sendMessage(req.body.message, req.body.chat_id, function() {
      res.send('message sent: ' + req.body.message);
    });
  });

  router.post('/webhook/:token', function(req, res) {
    processing.processMessage(req.body, function() {
      res.send('foo');
    });
  });

  router.get('/updates', function(req, res) {
    console.log('getUpdates()');
    bot.getUpdates(0, 10, null, function(updates) {
      res.json(updates);
    });
  });
  
  return router;
};