const 
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

mongoose.Promise = Promise;

module.exports = mongoose.model('User', Schema({
  platform_id: [{
    name: String,
    id: String,
    _id: false
  }],
  first_name: String,
  last_name: String,
  phone_number: String,
  email: String,
  gender: String,
  username: String,

  facebook_token: String,
  foobot_token: String,

  old_user_ids: [ObjectId],

  action: String              // A pending stateful action waiting to be fulfilled. eg. Condo waiting to be added
})
  .pre('save', function(next) {
    let user = this;
    let facebookId = user.platform_id.find(p => p.name === 'facebook');
    if(facebookId) {
      this.constructor.find({
        'platform_id.name': 'facebook',
        'platform_id.id': facebookId.id
      }).then(doc => {
        let joined = [...doc.platform_id, ...user.platform_id];
        user.platform_id = Array.from(new Set(joined));
        next(user);
      }).catch(err => next(user));
      
    } else next(user);
    
  })
);