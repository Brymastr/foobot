var mongoose = require('mongoose');
var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var messageSchema = Schema({
  message_id: Number,
  text: String,
  date: Date,
  user: String,
  chat_id: Number,
  chat_name: String,
  update_id: Number
});

module.exports = mongoose.model('Message', messageSchema);