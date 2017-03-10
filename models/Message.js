/*
Message object which helps define a global schema to work with throughout the app
Improvements:
  - Naming
  - Consolidate
*/  

const 
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId,
  usersController = require('../controllers/usersController');

mongoose.Promise = Promise;

module.exports = mongoose.model('Message', Schema({
  message_id: String,
  text: String,
  date: Date,
  user_id: {type: ObjectId, ref: 'User'},
  platform_from: Object,  // User as defined by telegram or messenger or whatever (wink wink, slack slack)
  chat_id: Number,
  chat_name: String,
  topic: String,
  action: String,         // Process Update uses this to figure out what to do next (eg. CallbackQuery)
  sentiment: Number,
  response: String,       // Text to use as response message
  keyboard: Array,
  // [[{
  //   type: String,
  //   text: String,
  //   url: String,
  //   data: String
  // }]],
  source: String,         // Platform the message was received from. eg Telegram, Messenger, Slack, etc... 
  other: Object           // Temporary stuff like telegram_id on contact sharing
})
  .pre('save', function(next) {
    let message = this;
    usersController.getUserByPlatformId(message.platform_from.id).then(user => {
      if(!user) {
        usersController.createUser({
          platform_id: [{name: message.source, id: message.platform_from.id}],
          first_name: message.platform_from.first_name,
          last_name: message.platform_from.last_name,
          username: message.platform_from.username
        }, _user => {
          message.user_id = _user._id;
          next();
        });
      } else {
        message.user_id = user._id;
        next();
      }
    }).catch(err => {
      console.error(err);
    });
  })
);