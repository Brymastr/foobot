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
    /* 
      decide what type of message
      decide what to do with it
      https://core.telegram.org/bots/webhooks
      Update types:
      message.text, edited_message.text, message.audio, message.voice,
      message.document, inline_query.query, chosen_inline_result.query, callback_query.data
    */
    processing.processUpdate(req.body, (response) => {
      log.debug('Response: ' + response.response);
      bot.sendMessage(response.response, response.chat_id, () => res.send(200));
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