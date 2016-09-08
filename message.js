var mongoose = require('mongoose');
var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var messageSchema = Schema({
  message_id: Number,
  text: String,
  date: Date,
  user: Object,
  chat_id: Number,
  chat_name: String,
  update_id: Number,
  topic: String,
  response: String
});

module.exports = mongoose.model('Message', messageSchema);