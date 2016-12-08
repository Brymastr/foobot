const 
  mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports = mongoose.model('User', Schema({
  facebook_id: String,        // If user is logged into facebook, eventually all accounts(telegram, slack, etc) will be linked to one user object
  telegram_id: String,
  //slack_id: String

  first_name: String,
  last_name: String,

  telegram_username: String,

  facebook_token: String,
  foobot_token: String
})
  .pre('save', function(next) {
    var user = this;
    this.constructor.find({facebook_id: user.facebook_id}, (err, doc) => {
      if(doc) {
        doc.forEach(d => {
          if(doc.telegram_id) user.telegram_id = d.telegram_id;
          //if(doc.slack_id) user.slack_id = d.slack_id;
        });
      }

      next(user);
    });
  })
);