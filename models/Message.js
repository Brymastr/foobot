var mongoose = require('mongoose');
var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

module.exports = mongoose.model('Message', Schema({
  message_id: Number,
  text: String,
  date: Date,
  user: Object,
  chat_id: Number,
  chat_name: String,
  update_id: Number,
  topic: String,
  response: String,     // Text to use a reponse message
  reply_markup: Object, // Use with response, for inline keyboards
  action: String       // Process Update uses this to figure out what to do next (eg. CallbackQuery)
}));