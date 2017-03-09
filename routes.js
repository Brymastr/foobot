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

module.exports = (passport, queueConnection) => {
  var router = express.Router();

  router.post('/webhook/:source/:token', (req, res) => {

    if(req.params.token != config.route_token && (req.params.source == 'messenger' && req.params.token != 'messenger')) {
      log.error('Invalid route token');
      res.sendStatus(403);
      return;
    }
    res.sendStatus(200);
    services.rabbit.pub(queueConnection, `incoming.message.${req.params.source}`, req.body);
  });

  router.post('/send/:chat_id', (req, res) => {
    // TODO: we must rebuild. This isn't going to work anymore
    res.sendStatus(200);
    processing.sendExternal(req.body.message, req.params.chat_id, message => console.log);
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
      services.rabbit.pub(queueConnection, `outgoing.message.${message.source}`, message);
      
      const post_auth = `
        <script type="text/javascript">
          if (window.opener) {
            window.opener.focus();
            if(window.opener.loginCallBack) {
              window.opener.loginCallBack();
            }
          }
          window.close();
        </script>`;
      if(message.source === 'messenger')
        res.redirect(params.redirect_uri + '&authorization_code=ITWORKS')
      else
        res.send(post_auth);
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

  // Get the URL that foobot is living at
  router.get('/info/webhook', (req, res) => {
    res.json({
      url: config.url,
      route_token: config.route_token
    });
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
      usersController.getUserByPlatformId(req.params.userId).then(user => {
        if(user) res.json(user);
        else usersController.getUser(req.params.userId).then(user => res.json(user));
      });
    }
  });

  router.delete('/users', (req, res) => {
    log.info('users deleted');
    usersController.deleteAllUsers(() => res.sendStatus(200));
  });

  router.all('/resetTelegramWebhook', (req, res) => {
    // services.telegram.setWebhook();
    res.sendStatus(200);
  });

  router.get('/loaderio-*', (req, res) => {
    res.sendFile(__dirname + '/loaderio');
  });
  
  return router;
};
