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
      res.sendStatus(200);
      if(message.response || message.reply_markup) {
        let length = message.response.length;
        let delay = Math.random() * 1;
        let timeout = (0.01 * length + delay) * 1000; // Human-like delay is about 0.08 seconds per character. 0.01 is much more tolerable and what you would expect from a superior being like foobot
        processing.sendTyping(message, config, () => {
          setTimeout(() => {
            processing.sendMessage(message, config, () => {
              if(message.topic == 'leave chat' && message.source == 'telegram')
                telegram.leaveChat(message.chat_id, config, () => {});
            });
          }, timeout);
        });
      }
    });
  });

  // Messenger verify
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
      state: encodeURIComponent(JSON.stringify({user_id: req.params.user_id, chat_id: req.params.chat_id})),
      scope: ['user_friends']
    })(req, res, next);
  });

  // Messages
  router.get('/messages/:chatId?/:userId?', (req, res) => {
    if(!req.params.chatId && !req.params.userId) 
      messagesController.getAllMessages(messages => res.json(messages));
    else if(req.params.chatId && !req.params.userId) 
      messagesController.getMessagesForConversation(req.params.chatId, messages => res.json(messages));
    else if(!req.params.chatId && req.params.userId) 
      messagesController.getMessagesForUser(req.params.userId, messages => res.json(messages));      
    else if(req.params.chatId && req.params.userId) 
      messagesController.getMessagesForUserByConversation(req.params.userId, req.params.chatId, messages => res.json(messages));      
    else
      res.send('probably never');
  });

  router.delete('/messages', (req, res) => {
    messagesController.deleteMessages((result) => {
      log.debug(result);
      res.send(200);
    });
  });

  router.get('/users/:userId?', (req, res) => {
    if(!req.params.userId) usersController.getAllUserIds(users => res.json(users));
    else {
      usersController.getUserByPlatformId(req.params.userId, user => {
        if(user) res.json(user);
        else usersController.getUser(req.params.userId, user => res.json(user));
      });
    }
  });

  router.delete('/users', (req, res) => {
    log.debug('users deleted');
    usersController.deleteAllUsers(() => res.send(200));
  })
  
  return router;
};