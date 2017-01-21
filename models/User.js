const 
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

module.exports = mongoose.model('User', Schema({
  facebook_id: String,        // app-scoped ID for a user of the Mortimer facebook app
  messenger_id: String,       // page-scoped ID for a user of the Mortimer page
  telegram_id: String,

  first_name: String,
  last_name: String,
  phone_number: String,
  email: String,
  gender: String,

  username: String,

  facebook_token: String,
  foobot_token: String,

  old_account_ids: [ObjectId],

  action: String              // A pending action waiting to be fulfilled. eg. Condo waiting to be added
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