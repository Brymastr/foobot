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
    /* 
      decide what type of message
      decide what to do with it
      https://core.telegram.org/bots/webhooks
      Update types:
        message.text, edited_message.text, message.audio, message.voice,
        message.document, inline_query.query, chosen_inline_result.query, callback_query.data
    */
    processing.processUpdate(req.body, classifier, (response) => {
      
      log.debug('Topic: ' + response.topic)
      log.debug(response)

      if(req.params.token != routeToken) {
        log.info('Invalid route token');
        res.sendStatus(401);
      } else if(response != undefined) {
        log.debug('Response: ' + response.response);
        bot.sendMessage(response, () => res.sendStatus(200));
      } else {
        res.sendStatus(200);
      }
    });
  });

  router.post('/updateContainer', (req, res) => {
    // Update the api container
    if(routeToken == 'token') {
      res.send('Bot not running in docker container');
    } else {
      // docker-compose pull api && docker-compose up --no-deps -d api
      res.send('This will update the docker container BUT NOT YET BECAUASE I HAVEN\'T IMPLEMENTED IT YET')
    }
  });

  router.get('/updates', (req, res) => {
    console.log('getUpdates()');
    bot.getUpdates(0, 10, null, function(updates) {
      res.json(updates);
    });
  });
  
  return router;
};