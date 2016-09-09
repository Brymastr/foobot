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
  response: String,
  reply_markup: Object
}));