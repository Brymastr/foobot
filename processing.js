const Message = require('./models/Message');
const InlineKeyboardButton = require('./models/InlineKeyboardButton');
const strings = require('./strings');
const messagesController = require('./controllers/messagesController');
const log = require('./logger');
const actions = require('./actions');


// Make the message into a local message without nulls
exports.conform = function(update) {
  let message = new Message({
    update_id: update.update_id
  });
  if(update.edited_message != undefined) {
    message.message_id = update.edited_message.message_id;
    message.date = update.edited_message.date;
    message.user = update.edited_message.from;
    message.chat_id = update.edited_message.chat.id;
    message.chat_name = update.edited_message.chat.first_name;
    message.action = 'edit';
  } else if(update.message != undefined) {
    message.message_id = update.message.message_id;
    message.date = update.message.date;
    message.user = update.message.from;
    message.chat_id = update.message.chat.id;
    message.chat_name = update.message.chat.first_name;
    message.text = update.message.text;
  } else if(update.callback_query != undefined) {
    message.message_id = update.callback_query.message.message_id;
    message.user = update.callback_query.from;
    message.chat_id = update.callback_query.message.chat.id;
    message.chat_name = update.callback_query.message.chat.first_name;
    message.text = update.callback_query.message.text;
    message.action = update.callback_query.data;
  }

  if(message.text == undefined)
    message.text = '';

  return message;
}

exports.processUpdate = function(update, classifier, cb) {
  /*
    There are three ways of deciding what to do.
    There is a heirarchy in which messages are processed
    1. Action - Edited messages, Callback Queries, and other good stuff
    2. Topic - What the classifier thinks of the message contents
    3. Message content - If 1 and 2 are null, then maybe respond based on the actual text of the message

    The callback object from this method is the message that will be sent to the telegram api
  */

  // Conform to my message model
  let message = this.conform(update);
  message.topic = classifier.classify(message.text);
  // Save ALL messages  
  messagesController.createMessage(message, (m) => log.info(`Message saved: ${m.text}`));
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
      message.response = 'You fucking wish';
      cb(message);
    } else {
      // Return the message in case it's boring and doesn't make foobot do anything
      cb(message);
    }
  }
};