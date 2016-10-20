const 
  InlineKeyboardButton = require('./models/InlineKeyboardButton'),
  strings = require('./strings'),
  messagesController = require('./controllers/messagesController'),
  log = require('./logger'),
  actions = require('./actions'),
  telegram = require('./services/telegram');

exports.conform = (update, platform) => {
  let message;

  if(platform == 'telegram') message = telegram.conform(update);

  message.source = platform;
  return message;
}

exports.processUpdate = (update, platform, classifier, cb) => {
  /*
    There is a heirarchy in which messages are processed
    1. Action - Edited messages, Callback Queries, and other good stuff
    2. Topic - What the classifier thinks of the message contents
    3. Message content - If 1 and 2 are null, then maybe respond based on the actual text of the message
  */

  // Conform to my message model
  let message = this.conform(update, platform);
  message.topic = classifier.classify(message.text);
  // Save ALL messages  
  messagesController.createMessage(message, m => {});

  // Actions
  if(message.action != undefined) {
    if(message.action == 'edit')
      message.response = strings.$('edit', message.user.first_name);
    else if(message.action == 'confirm')
      message.response = 'This will update the docker container BUT NOT YET BECAUASE I HAVEN\'T IMPLEMENTED IT YET CHILL THE FUCK OUT I\'M WORKING ON IT OK ROBOTS DON\'T WRITE THEMSELVES OVERNIGHT';
    else if(message.action == 'deny')
      message.response = 'Nnnnooooooooooo';
    else
      message.response = 'I think I\'m supposed to do something here but I\'m not really sure what';
    cb(message);    
  } 
  
  // Topics
  else if(message.topic != undefined && message.topic != 'else') {
    if(message.topic == 'update') {
      /** Deprecated **/
      // message = actions.update(message);
      cb(message);
    } else if(message.topic == 'flights') {
      /** Not working: QPX returning 'limit reached' **/
      // actions.flights(message, (data) => {
      //   cb(data);
      // });
      cb(message);
    } else if(message.topic == 'track') {
      // TODO: get the tracking number and query canada post for tracking info. Assign to message text
      actions.trackPackage(message.text, (info) => {
        message.response = info;
        cb(message);
      });
    } else {
      cb(message);
    }
  }

  // Message content
  else {
    if(message.text.match(/(define)/i)) {
      const word = message.text.split(/(define)/i)[2];
      actions.define(message, word, (result) => cb(result));
    } else if(message.text.match(/(kanye)/i)) {
      message.response = actions.iMissTheOldKanye();
      cb(message);
    } else if(message.text.match(/(foobot)/i)) {
      message.response = actions.iAmFoobot();
      cb(message);
    } else if(message.text.match(/(remind me)/i)) {
      message.response = 'I\'m not smart enough for that yet.';
      cb(message);
    } else {
      // Return the message in case it's boring and doesn't make foobot do anything
      cb(message);
    }
  }
};

// one sendMessage to rule them all
exports.sendMessage = (message, config, done) => {
  log.info(`Message response => ${message.response}`)
  if(message.source == 'telegram')
    telegram.sendMessage(message, config, body => {done(body)});
}