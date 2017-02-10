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


exports.processUpdate = (update, platform, classifier) => {
  /*
    There is a heirarchy in which messages are processed
    1. Action - Edited messages, Callback Queries, and other good stuff
    2. Topic - What the classifier thinks of the message contents
    3. Content - If 1 and 2 are null, then maybe respond based on the actual text of the message
  */
  return new Promise((resolve, reject) => {
    // Conform to my message model
    let message = this.conform(update, platform);
    message.topic = classifier.classify(message.text);
    message.sentiment = sentiment(message.text).score;

    // Save ALL messages  
    messagesController.createMessage(message, (m, u) => {
      // Actions
      if(m.action) {
        if(m.action == 'edit') {
          m.response = strings.$('edit');
          resolve(m);
        } else if(m.action == 'contact') {
          usersController.savePhoneNumber(message, result => resolve(result));
        } else {
          // This message doesn't warrant a response
          resolve(m);
        }
      
      // Topics
      } else if(m.topic && m.topic != 'else') {
        if(m.topic == 'update') {
          /** Deprecated **/
          // message = actions.update(message);
          resolve(m);
        } else if(m.topic == 'flights') {
          /** Not working: QPX returning 'limit reached' **/
          actions.flights(message, (data) => {
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
          actions.openCondo(m, u.phone_number, result => resolve(result));
        } else if(m.topic == 'condo entry lock') {
          actions.closeCondo(m, u.phone_number, result => resolve(result));
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
          // Message.findOne where message_id < this one and chat_id is this one
          Message.findOne({message_id: {$lt: m.message_id}, chat_id: m.chat_id}, (err, doc) => {
            if(doc) m.response = strings.$('reactivated');
            else m.response = strings.$('activated');
            resolve(m);
          });
        } else {
          // No Action, Topic, or interesting Content. Just callback with the incoming message
          resolve(m);
        }
      }

    });
  });
};

// required in order to set source as 'external' and to choose which sendMessage to use based on chat_id format
exports.sendExternal = (content, chat_id, done) => {
  let message = new Message({
    chat_id,
    response: content,
    source: 'external'
  });
  if(chat_id.length === 17)
    services.messenger.sendMessage(message, body => done(body));
  else  // TODO: this works until I add another chat platform
    services.telegram.sendMessage(message, body => done(body));
};

// one sendMessage to rule them all
exports.sendMessage = message => {
  return new Promise((resolve, reject) => {
    log.info(`Message response => ${message.response}`);
    if(message.source)
      services[message.source].sendMessage(message, body => resolve(message));
    else reject()
  });
  
};

// Send the three dot thing to indicate foobity is typing
exports.sendTyping = message => {
  return new Promise((resolve, reject) => {
    if(message.source)
      services[message.source].sendTyping(message, body => resolve(message));
    else reject();
  });
  
};

exports.editMessage = (message, done) => {
  log.debug(`Edit message`);
  message.reply_markup = '';
  if(message.source == 'telegram')
    services.telegram.editMessageText(message, body => done(body));
};

exports.conform = (update, platform) => {
  let message;
  message = services[platform].conform(update);
  message.source = platform;
  return message;
}