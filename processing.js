const 
  strings = require('./strings'),
  messagesController = require('./controllers/messagesController'),
  log = require('./logger'),
  actions = require('./actions'),
  services = require('./services'),
  sentiment = require('sentiment'),
  usersController = require('./controllers/usersController'),
  Message = require('./models/Message'),
  membersController = require('./controllers/membersController'),
  config = require('./config.json');

exports.processUpdate = (message, queueConnection, classifier) => {
  // Process incoming message then put back on the appropriate queue
  this.process(message, classifier)
    .then(m => services.rabbit.pub(queueConnection, `outgoing.message.${m.source}`, m));
};


/**
 * There is a heirarchy in which messages are processed
 * 1. Action - Edited messages, Callback Queries, and other good stuff
 * 2. Topic - What the classifier thinks of the message contents
 * 3. Content - If 1 and 2 are null, then maybe respond based on the actual text of the message
*/
exports.process = (message, classifier) => {
  return new Promise((resolve, reject) => {
    message.topic = classifier.classify(message.text);
    message.sentiment = sentiment(message.text).score;

    // Save ALL messages  
    messagesController.saveMessage(message).then(m => {
      message.normalized = true;
      // Actions
      if(message.action) {
        if(message.action == 'edit') {
          message.response = strings.$('edit');
          resolve(message);
        } else if(message.action == 'contact') {
          usersController.savePhoneNumber(message, result => resolve(result));
        } else {
          // This message doesn't warrant a response
          resolve(message);
        }
      
      // Topics
      } else if(message.topic && message.topic != 'else') {
        if(message.topic == 'update') {
          /** Deprecated **/
          // message = actions.update(message);
          resolve(message);
        } else if(message.topic == 'flights') {
          /** Not working: QPX returning 'limit reached' **/
          actions.flights(message, (data) => {
            resolve(data);
          });
          resolve(message);
        } else if(message.topic == 'shorten url') {
          actions.shortenUrl(m, config, short => {
            message.response = short || 'Ziip has died, may it rest in peace';
            resolve(message);
          });
        } else if(message.topic == 'track package') {
          actions.trackPackage(message.text, config, info => {
            message.response = info;
            resolve(message);
          });
        } else if(message.topic == 'member berries') {
          membersController.saveMember(m, () => {
            message.response = 'Oooooo I \'member!!!';
            resolve(message);
          });
        } else if(message.topic == 'member berries query') {
          membersController.recall(m, member => {
            message.response = member;
            resolve(message);
          });
        } else if(message.topic == 'facebook login') {
          m = actions.facebookLogin(config, m);
          resolve(message);        
        } else if(message.topic == 'condo entry setup') {
          actions.linkCondo(m, result => resolve(result));
        } else if(message.topic == 'condo entry access') {
          actions.openCondo(m, message.user.phone_number, result => resolve(result));
        } else if(message.topic == 'condo entry lock') {
          actions.closeCondo(m, message.user.phone_number, result => resolve(result));
        } else {
          resolve(message);
        }

      // Content
      } else {
        if(message.text.match(/\b(define)\b/i)) {
          const word = message.text.split(/(define)/i)[2];
          actions.uDic(m, word, result => resolve(result));
        } else if(message.text.match(/\b(kanye|yeezy|yeezus|pablo)\b/i)) {
          message.response = actions.iMissTheOldKanye();
          resolve(message);
        } else if(message.text.match(/it('s)?\s*(is)?\s*(was)?\s*(so|pretty|really|very)\s*(hard|long)/)) {
          message.response = 'That\'s what she said!';
          resolve(message);
        } else if(message.text.match(/\b(foobot|morty|mortimer)\b can you/i)) {
          message.response = strings.$('ofCourseICan');
          resolve(message);
        // all other word matching should go before this one
        } else if(message.text.match(/\b(foobot|morty|mortimer)\b/i)) {
          if(message.text.match(/love you/i)) {
            message.response = `I love you too, ${message.platform_fromessage.first_name}`;
          } else if(message.sentiment < -1) {
            message.response = strings.$('leaveChat');
            message.topic = 'leave chat';
          } else message.response = actions.iAmFoobot();
          resolve(message);
        } else if(message.text == '') {
          // Message.findOne where message_id < this one and chat_id is this one
          Message.findOne({message_id: {$lt: message.message_id}, chat_id: message.chat_id}, (err, doc) => {
            if(doc) message.response = strings.$('reactivated');
            else message.response = strings.$('activated');
            resolve(message);
          });
        } else {
          // No Action, Topic, or interesting Content. Just callback with the incoming message
          resolve(message);
        }
      }
    });
  });
};