const 
  processing = require('./processing'),
  express = require('express'),
  log = require('./logger'),
  strings = require('./strings'),
  Message = require('./models/Message'),
  messagesController = require('./controllers/messagesController'),
  usersController = require('./controllers/usersController'),
  telegram = require('./services/telegram');


module.exports = (config, passport, classifier) => {
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
      if(message.response || message.reply_markup) {
        processing.sendMessage(message, config, () => {
          if(message.topic == 'leave chat' && message.source == 'telegram')
            telegram.leaveChat(message.chat_id, config, () => res.sendStatus(200));
          else res.sendStatus(200);
        });
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
  router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {session: false, failureRedirect: '/'}),
    (req, res) => {
      let message = new Message({
        response: strings.$('facebookLoginSuccessful'),
        chat_id: req.user.chat_id,
        source: 'telegram'
      });
      processing.sendMessage(message, config, () => {
        // TODO: send message to chat id it came from
        let post_auth = `
          <script type="text/javascript">
            if (window.opener) {
              window.opener.focus();
              if(window.opener.loginCallBack) {
                window.opener.loginCallBack();
              }
            }
            window.close();
          </script>`;
        res.send(post_auth);
      });        
    }
  );

  router.get('/auth/facebook/:user_id/:chat_id', (req, res, next) => {
    passport.authenticate('facebook', {
      state: encodeURIComponent(JSON.stringify({user_id: req.params.user_id, chat_id: req.params.chat_id}))
    })(req, res, next);
  });

  // Messages
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