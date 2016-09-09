const pos = require('pos');
const chunker = require('pos-chunker');
const Message = require('./models/Message');
const InlineKeyboardButton = require('./models/InlineKeyboardButton');
const fs = require('fs');
const strings = require('./strings');

this.kanye = 'I miss the old kanye';
this.kanyeDoc = fs.readFile('./kanye.txt', 'utf-8', (err, data) => {
  if(err) data = err;
  this.kanye = data;
})

exports.isTrigger = function(text) {
  return !!text.match(/(foobot)/i);
};

exports.mapUpdate = function(update) {
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

exports.getKanye = () => {
  let kanye = this.kanye.split(/[,\n]+/).map(line => line.replace('\\', ''));
  return kanye[Math.floor(Math.random() * (kanye.length - 1))]
}

exports.processUpdate = function(update, classifier, cb) {
  /*
    There are three ways of deciding what to do.
    There is a heirarchy in which messages are processed
    1. Action - Edited messages, Callback Queries, and other good stuff
    2. Topic - What the classifier thinks of the message contents
    3. Message content - If 1 and 2 are null, then maybe respond based on the actual text of the message
  */

  let message = this.mapUpdate(update);
  message.topic = classifier.classify(message.text);

  // Actions
  if(message.action != undefined || message.action != null) {
    if(message.action == 'edit')
      message.response = strings.$('edit', message.user.first_name);
    else if(message.action == 'confirm')
      message.response = 'She said yes!!!!';
    else if(message.action == 'deny')
      message.response = 'Nnnnooooooooooo';
    else
      message.response = 'I think I\'m supposed to do something here but I\'m not really sure what';
  } 
  // Topics
  else if(message.topic != undefined || message.topi != null) {
    if(message.topic == 'update') {
      message.response = 'Do you want me to update myself?';
      message.reply_markup = {
        inline_keyboard: [[
          new InlineKeyboardButton({
            text: 'Yes',
            callback_data: 'confirm'
          }),
          new InlineKeyboardButton({
            text: 'No',
            callback_data: 'deny'
          })
        ]]
      }
    }
  }
  // Message content
  else {
    if(message.text.match(/(kanye)/i)) message.response = this.getKanye();
    else if(message.text.match(/(foobot)/i)) message.response = 'Hey, that\'s me!';
  }

  cb(message);
};