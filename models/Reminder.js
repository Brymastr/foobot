/*
Reminder class to remind a user of a given string on a given date
Improvements:

*/  

var mongoose = require('mongoose');
var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

module.exports = mongoose.model('Reminder', Schema({
  message_id: Number,   // This is a foreign key type reference to the message schema
  text: String,
  date_created: Date,
  user_id: Number,
  chat_id: Number,
  reminder_date: Date,  // Date for next occurrence
  scheme: String,   // once, minute, hour, day, week, month, year
  active: Boolean
}));