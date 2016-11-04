/*
Message object which helps define a global schema to work with throughout the app
Improvements:
  - Naming
*/  

const 
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId,
  usersController = require('../controllers/usersController');

module.exports = mongoose.model('Message', Schema({
  message_id: String,
  text: String,
  date: Date,
  user_id: ObjectId,
  platform_from: Object,// User as defined by telegram or messenger or whatever
  chat_id: Number,
  chat_name: String,
  update_id: String,
  topic: String,
  sentiment: Number,
  response: String,     // Text to use as response message
  reply_markup: Object, // Use with response, for inline keyboards
  action: String,       // Process Update uses this to figure out what to do next (eg. CallbackQuery)
  type: String,         // The type of the message. Some types should be turned into other objects, like reminders
  source: String,       // Platform the message was received from. eg Telegram, Messenger, Slack, etc... 
  reply_to: String      // In telegram, the message_id to reply to. Just assign message_id to this val to make it a reply message
})
  .pre('save', next => {
    let message = this;

    // Create a new user if this message doesn't have a user_id (user has never sent a message to foobot, this is the first)
    if(!message.user_id) {
      let id;
      let user;
      if(message.source == 'telegram') {
        usersController.createUser({
          telegram_id: message.from.id,
          first_name: message.from.first_name,
          last_name: message.from.last_name,
          username: message.from.username
        }, () => {next()});
      } else if(message.source == 'messenger') {
        usersController.createUser({
          facebook_id: message.from.id//,
          // first_name: message.from.first_name,
          // last_name: message.from.last_name,
          // username: message.from.username
        }, () => {next()});
      }
      next();
    }
  })
);