const 
  strings = require('./strings'),
  messagesController = require('./controllers/messagesController'),
  log = require('./logger'),
  actions = require('./actions'),
  services = require('./services'),
  sentiment = require('sentiment'),
  usersController = require('./controllers/usersController'),
  Message = require('./models/Message'),
  membersController = require('./controllers/membersController');

exports.conform = (update, platform) => {
  let message;

  if(platform == 'telegram') message = services.telegram.conform(update);
  else if(platform == 'messenger') message = services.messenger.conform(update);

  message.source = platform;

  return message;
}

exports.processUpdate = (update, platform, classifier, config, cb) => {
  /*
    There is a heirarchy in which messages are processed
    1. Action - Edited messages, Callback Queries, and other good stuff
    2. Topic - What the classifier thinks of the message contents
    3. Content - If 1 and 2 are null, then maybe respond based on the actual text of the message
  */

  // Conform to my message model
  let message = this.conform(update, platform);
  message.topic = classifier.classify(message.text);
  message.sentiment = sentiment(message.text).score;

  // Save ALL messages  
  messagesController.createMessage(message, (m, u) => {
    // Actions
    if(m.action) {
      if(m.action == 'edit')
        m.response = strings.$('edit');
      else if(m.action == 'confirm')
        m.response = 'This will update the docker container BUT NOT YET BECAUASE I HAVEN\'T IMPLEMENTED IT YET CHILL THE FUCK OUT I\'M WORKING ON IT OK ROBOTS DON\'T WRITE THEMSELVES OVERNIGHT';
      else if(m.action == 'deny')
        m.response = 'Nnnnooooooooooo';
      else
        m.response = 'I think I\'m supposed to do something here but I\'m not really sure what';
      cb(m);    
    } 
    
    // Topics
    else if(m.topic && m.topic != 'else') {
      if(m.topic == 'update') {
        /** Deprecated **/
        // message = actions.update(message);
        cb(m);
      } else if(m.topic == 'flights') {
        /** Not working: QPX returning 'limit reached' **/
        // actions.flights(message, (data) => {
        //   cb(data);
        // });
        cb(m);
      } else if(m.topic == 'track') {
        actions.trackPackage(m.text, config, info => {
          m.response = info;
          cb(m);
        });
      } else if(m.topic == 'member berries') {
        membersController.saveMember(m, () => {
          m.response = 'Oooooo I \'member!!!';
          cb(m);
        });
      } else if(m.topic == 'member berries query') {
        membersController.recall(m, member => {
          m.response = member;
          cb(m);
        });
      } else if(m.topic == 'facebook login') {
        m = actions.facebookLogin(config, m);
        cb(m);        
      } else {
        cb(m);
      }
    }

    // Content
    else {
      if(m.text.match(/(define)/i)) {
        const word = m.text.split(/(define)/i)[2];
        actions.define(m, word, (result) => cb(result));
      } else if(m.text.match(/(kanye)/i)) {
        m.response = actions.iMissTheOldKanye();
        cb(m);
      } else if(m.text.match(/(foobot|morty|mortimer)/i)) {
        if(m.text.match(/love you/i)) {
          m.response = `I love you too, ${m.platform_from.first_name}`;
        } else if(m.sentiment < -1) {
          m.response = strings.$('leaveChat');
          m.topic = 'leave chat';
        } else m.response = actions.iAmFoobot();
        cb(m);
      } else if(m.text == '') {
        // Message.findOne where message_id < this one and chat_id is this one
        Message.findOne({message_id: {$lt: m.message_id}, chat_id: m.chat_id}, (err, doc) => {
          if(doc) m.response = strings.$('reactivated');
          else m.response = strings.$('activated');
          cb(m);
        });
      } else {
        // No Action, Topic, or interesting Content. Just callback with the incoming message
        cb(m);
      }
    }

  });
};

// one sendMessage to rule them all
exports.sendMessage = (message, config, done) => {
  log.info(`Message response => ${message.response}`);
  if(message.source == 'telegram')
    services.telegram.sendMessage(message, config, body => {done(body)});
  else if(message.source == 'messenger')
    services.messenger.sendMessage(message, config, body => {done(body)});    
};

// Send the three dot thing to indicate foobity is typing
exports.sendTyping = (message, config, done) => {
  if(message.source == 'telegram') {
    services.telegram.sendTyping(message, config, body => done(body));
  }
};

exports.editMessage = (message, config, done) => {
  log.debug(`Edit message`);
  message.reply_markup = '';
  if(message.source == 'telegram')
    services.telegram.editMessageText(message, config, body => done(body));
};