const 
  processing = require('./processing'),
  express = require('express'),
  log = require('./logger'),
  messagesController = require('./controllers/messagesController');


module.exports = (config, classifier) => {
  var router = express.Router();

  // Turn the 'update' into a local 'message' object
  // Decide what type of message it is
  //   - Maybe a different type all together based on message text
  // Save to database as correct object type
  // Send back message object

  // Reference message id in other objects. Reminders should know which message they came from

  router.route('/webhook/:source/:token', (req, res) => {

    if(req.params.token != config.route_token 
    || (req.params.source == 'messenger' && req.token != 'messenger')) {
      log.error('Invalid route token');
      res.sendStatus(403);
      return;
    }

    processing.processUpdate(req.body, req.params.source, classifier, (response) => {
      if(response != undefined) { // Don't really care about the response for now
        processing.sendMessage(response, config, response => res.sendStatus(200));
      } else {
        res.sendStatus(200);
      }
    });
  });

  // Messenger
  router.get('/webhook/messenger/:token', (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' 
    && req.query['hub.verify_token'] === config.messenger.webhook_token) {
      res.status(200).send(req.query['hub.challenge']);
    } else {
      res.sendStatus(403);
    }  
  });

  router.get('/messages/:chatId?/:userId?', (req, res) => {
    if(req.params.chatId == undefined && req.params.userId == undefined) 
      messagesController.getAllMessages(messages => res.json(messages));
    else if(req.params.chatId != undefined && req.params.userId == undefined) 
      messagesController.getMessagesForConversation(req.params.chatId, messages => res.json(messages));
    else if(req.params.chatId == undefined && req.params.userId != undefined) 
      messagesController.getMessagesForUser(req.params.userId, messages => res.json(messages));      
    else if(req.params.chatId != undefined && req.params.userId != undefined) 
      messagesController.getMessagesForUserByConversation(req.params.userId, req.params.chatId, messages => res.json(messages));      
    else
      res.send('probably never');
  });

  router.delete('/messages', (req, res) => {
    messagesController.deleteMessages((result) => {
      log.debug(result);
      res.send(result);
    });
  });
  
  return router;
};