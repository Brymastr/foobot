const bot = require('./telegramBotApi');
const processing = require('./processing');
const express = require('express');
const log = require('./logger');
const messagesController = require('./controllers/messagesController');


module.exports = function(routeToken, classifier) {
  var router = express.Router();

  // Turn the 'update' into a local 'message' object
  // Decide what type of message it is
  //   - Maybe a different type all together based on message text
  // Save to database as correct object type
  // Send back message object

  // Save ALL messages
  // Reference message id in other objects. Reminders should know which message they came from

  router.post('/webhook/:token', (req, res) => {
    processing.processUpdate(req.body, classifier, (response) => {
      if(req.params.token != routeToken) {
        log.info('Invalid route token');
        res.sendStatus(401);
      } else if(response != undefined) {
        log.debug('Response: ' + response);
        bot.sendMessage(response, () => res.sendStatus(200));
      } else {
        res.sendStatus(200);
      }
    });
  });

  router.get('/messages/:chatId?/:userId?', (req, res) => {
    if(req.params.chatId == undefined && req.params.userId == undefined) {
      res.json(messagesController.getAllMessages)
    } else if(req.params.chatId != undefined && req.params.userId == undefined) {
      res.send('all messages for chat ' + req.params.chatId)
    } else if(req.params.chatId == undefined && req.params.userId != undefined) {
      res.send('all messages for user ' + req.params.userId)
    } else if(req.params.chatId != undefined && req.params.userId != undefined) {
      res.send('all messages for user ' + req.params.userId + ' and chat ' + req.params.chatId)
    } else {
      res.send('probably never')
    }
  });
  
  return router;
};