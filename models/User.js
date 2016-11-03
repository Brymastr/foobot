const 
  mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports = mongoose.model('User', Schema({
  facebook_id: String,
  telegram_id: String,  

  first_name: String,
  last_name: String,

  telegram_username: String,

  facebook_token: String,
  foobot_token: String
}));