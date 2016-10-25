/*
Message object which helps define a global schema to work with throughout the app
Improvements:
  - Naming
*/  

const 
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

module.exports = mongoose.model('Message', Schema({
  message_id: String,
  text: String,
  date: Date,
  user: Object,
  chat_id: Number,
  chat_name: String,
  update_id: String,
  topic: String,
  response: String,     // Text to use as response message
  reply_markup: Object, // Use with response, for inline keyboards
  action: String,       // Process Update uses this to figure out what to do next (eg. CallbackQuery)
  type: String,         // The type of the message. Some types should be turned into other objects, like reminders
  source: String        // Platform the message was received from. eg Telegram, Messenger, Slack, etc... 
}));