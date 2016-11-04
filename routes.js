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

  router.post('/webhook/:source/:token', (req, res) => {

    if(req.params.token != config.route_token && (req.params.source == 'messenger' && req.params.token != 'messenger')) {
      log.error('Invalid route token');
      res.sendStatus(403);
      return;
    }

    processing.processUpdate(req.body, req.params.source, classifier, config, message => {
      if(message.response || message.reply_markup) { // Don't really care about the response for now
        processing.sendMessage(message, config, () => res.sendStatus(200));
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

  // Phonehome
  router.post('/remember', (req, res) => {
    // save a 'remember' object to the database

    // first use case is saving home IP. Generic 'remember' object
    log.info(req.body);
    res.send('Eventually saving stuff');
  });

  // Facebook auth
  router.get('/auth/facebook/:user_id', passport.authenticate('facebook'));

  router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {session: false, failureRedirect: '/'}),
    (req, res) => {res.redirect(`/auth/facebook/token?access_token=${req.user.facebook_token}`)}
  );

  router.get('/auth/facebook/token', (req, res) => {
    let access_token = req.query.access_token;
    log.debug(req.body)
    log.debug(req.params)
    // lookup user
    // save access_token to user.facebook_token
    // maybe login user to facebook and save id to user object
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