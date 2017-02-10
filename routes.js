const 
  processing = require('./processing'),
  express = require('express'),
  log = require('./logger'),
  strings = require('./strings'),
  Message = require('./models/Message'),
  messagesController = require('./controllers/messagesController'),
  usersController = require('./controllers/usersController'),
  services = require('./services'),
  config = require('./config.json');

var rabbitConnection = 


module.exports = (passport, classifier) => {
  var router = express.Router();

  // Turn the 'update' into a local 'message' object
  // Decide what type of message it is
  //   - Maybe a different type all together based on message text
  // Save to database as correct object type
  // Send back message object

  router.post('/webhook/:source/:token', (req, res) => {

    if(req.params.token != config.route_token && (req.params.source == 'messenger' && req.params.token != 'messenger')) {
      log.error('Invalid route token');
      res.sendStatus(403);
      return;
    }
    res.sendStatus(200);

    processing.processUpdate(req.body, req.params.source, classifier)
      .then(message => {
        return services.rabbit.pub(`${req.params.source} message`, message)
      })
      .then(message => {
        if(message.response || message.reply_markup)
          return processing.sendTyping(message);
        else return Promise.reject('No response');
      })
      .then(message => {
        let length = message.response.length;
        let delay = Math.random() * 1; // Add up to one second extra delay, set randomly for that human feel
        let timeout = (0.02 * length + delay) * 1000; // Human-like delay is about 0.08 seconds per character. 0.02 is much more tolerable and what you would expect from a superior being like foobot
        setTimeout(() => {
          return processing.sendMessage(message);
        }, timeout);
      })
      .then(message => {
        if(message.source == 'telegram' && message.topic == 'leave chat')
          return services.telegram.leaveChat(message.chat_id);
        else return Promise.resolve();
      })
      .then(result => { 
        if(result) log.info('Foobot left the chat');
      })
      .catch(log.debug); // Do something with this. Or don't, it's all going away soon anyway.
  });

  router.post('/send/:chat_id', (req, res) => {
    // TODO: get some security up in here. Need to agree with Mark on something
    res.sendStatus(200);
    processing.sendExternal(req.body.message, req.params.chat_id, message => {});
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
    passport.authenticate('facebook', {session: false, failureRedirect: '/'}), (req, res) => {
      let params = JSON.parse(decodeURIComponent(req.query.state));
      let message = new Message({
        response: strings.$('facebookLoginSuccessful'),
        chat_id: req.user.chat_id,
        source: params.source
      });
      processing.sendMessage(message, () => {
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
        if(message.source == 'messenger')
          res.redirect(params.redirect_uri + '&authorization_code=ITWORKS')
        else
          res.send(post_auth);
      });        
    }
  );

  router.get('/auth/facebook/:source/:user_id/:chat_id', (req, res, next) => {
    passport.authenticate('facebook', {
      state: encodeURIComponent(JSON.stringify({
        user_id: req.params.user_id,
        chat_id: req.params.chat_id,
        source: req.params.source,
        account_linking_token: req.query.account_linking_token,
        redirect_uri: req.query.redirect_uri
      })),
      scope: ['user_friends']
    })(req, res, next);
  });

  // Messages (this is pretty bad, don't need a route for this)
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

  // Get rid of the rest of these by v1.0
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
    log.info('users deleted');
    usersController.deleteAllUsers(() => res.send(200));
  });
  
  return router;
};
