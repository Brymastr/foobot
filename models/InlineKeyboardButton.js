var mongoose = require('mongoose');
var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

module.exports = mongoose.model('InlineKeyboardButton', Schema({
  text: String,
  url: String,
  callback_data: String
}));
