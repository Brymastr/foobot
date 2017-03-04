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
      // Actions
      if(m.action) {
        if(m.action == 'edit') {
          m.response = strings.$('edit');
          resolve(m);
        } else if(m.action == 'contact') {
          usersController.savePhoneNumber(m).then(result => resolve(result));
        } else {
          resolve(m);
        }
      
      // Topics
      } else if(m.topic && m.topic != 'else') {
        if(m.topic == 'flights') {
          /** Not working: QPX returning 'limit reached' **/
          actions.flights(m, (data) => {
            resolve(data);
          });
          resolve(m);
        } else if(m.topic == 'shorten url') {
          actions.shortenUrl(m, config, short => {
            m.response = short || 'Ziip has died, may it rest in peace';
            resolve(m);
          });
        } else if(m.topic == 'track package') {
          actions.trackPackage(m.text, config, info => {
            m.response = info;
            resolve(m);
          });
        } else if(m.topic == 'member berries') {
          membersController.saveMember(m, () => {
            m.response = 'Oooooo I \'member!!!';
            resolve(m);
          });
        } else if(m.topic == 'member berries query') {
          membersController.recall(m, member => {
            m.response = member;
            resolve(m);
          });
        } else if(m.topic == 'facebook login') {
          m = actions.facebookLogin(config, m);
          resolve(m);        
        } else if(m.topic == 'condo entry setup') {
          actions.linkCondo(m, result => resolve(result));
        } else if(m.topic == 'condo entry access') {
          actions.openCondo(m, m.user.phone_number, result => resolve(result));
        } else if(m.topic == 'condo entry lock') {
          actions.closeCondo(m, m.user.phone_number, result => resolve(result));
        } else {
          resolve(m);
        }

      // Content
      } else {
        if(m.text.match(/\b(define)\b/i)) {
          const word = m.text.split(/(define)/i)[2];
          actions.uDic(m, word, result => resolve(result));
        } else if(m.text.match(/\b(kanye|yeezy|yeezus|pablo)\b/i)) {
          m.response = actions.iMissTheOldKanye();
          resolve(m);
        } else if(m.text.match(/it('s)?\s*(is)?\s*(was)?\s*(so|pretty|really|very)\s*(hard|long)/)) {
          m.response = 'That\'s what she said!';
          resolve(m);
        } else if(m.text.match(/\b(foobot|morty|mortimer)\b can you/i)) {
          m.response = strings.$('ofCourseICan');
          resolve(m);
        // all other word matching should go before this one
        } else if(m.text.match(/\b(foobot|morty|mortimer)\b/i)) {
          if(m.text.match(/love you/i)) {
            m.response = `I love you too, ${m.platform_from.first_name}`;
          } else if(m.sentiment < -1) {
            m.response = strings.$('leaveChat');
            m.topic = 'leave chat';
          } else m.response = actions.iAmFoobot();
          resolve(m);
        } else if(m.text == '') {
          // m.findOne where m_id < this one and chat_id is this one
          m.findOne({m_id: {$lt: m.m_id}, chat_id: m.chat_id}, (err, doc) => {
            if(doc) m.response = strings.$('reactivated');
            else m.response = strings.$('activated');
            resolve(m);
          });
        } else {
          // No Action, Topic, or interesting Content. Just callback with the incoming m
          resolve(m);
        }
      }
    });
  });
};