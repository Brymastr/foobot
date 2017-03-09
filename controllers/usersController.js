const
  log = require('../logger'),
  User = require('../models/User'),
  Message = require('../models/Message');

exports.createUser = (data, cb) => {
  new User({
    first_name: data.first_name,
    last_name: data.last_name,
    platform_id: data.platform_id,
  }).save((err, user) => {
    if (err) log.err(`Error creating user: ${err}`);
    else log.debug(`User created: ${user}`);
    cb(user);
  });
};

exports.getUser = id => new Promise(resolve => {
  User.findOne({ _id: id }).exec().then(resolve);
});

exports.getUserByPlatformId = id => new Promise(resolve => {
  User.findOne({platform_id: {$elemMatch: {id}}}).exec().then(resolve);
});

exports.consolidateUsers = user => new Promise(resolve => {
  let facebook_id = user.platform_id.find(p => p.name === 'facebook');
  User.findOne({
    platform_id: {$elemMatch: {name: 'facebook', id: facebook_id.id}},
    _id: {$ne: user._id}
  }).exec().then(other => {
    if(other) {
      let joined = [...other.platform_id, ...user.platform_id];
      let consolidated = Object.assign(user, other);
      if(!consolidated.old_user_ids) consolidated.old_user_ids = [];
      consolidated.old_user_ids.push(user._id);
      consolidated.platform_id = removeDuplicateFacebookIds(joined);
      consolidated.markModified('platform_id');
      consolidated.save().then(consolidatedDoc => {
        user.remove().then(thisDoc => {
          console.log(consolidatedDoc);
          resolve(consolidatedDoc);
        });
      });

    } else {
      resolve(user);
    }
  });
});

function removeDuplicateFacebookIds(list) {
  let index = list.findIndex(obj => obj.name === 'facebook');
  list.splice(index, 1);
  return list;
}

exports.savePhoneNumber = message => {
  return new Promise((resolve, reject) => {
    User.findOne({_id: message.user_id}).exec().then(user => {
      let telegramId = user.platform_id.find(p => p.name === 'telegram').id;
      if(message.other.contact_telegram_id == telegramId && user.action == 'phone_number') {
        user.phone_number = message.text.substr(1) === '+' ? message.text : '+' + message.text;
        user.action = null;
        user.save((err, doc) => {
          message.response = 'Condo account linked';
          resolve(message);
        });
      }
    })
    .catch(err => console.warn);
  });
};

// Don't keep this
exports.getAllUserIds = cb => {
  User.find({}, 'platform_id').exec().then(users => {
    cb(users);
  });
};

// Or this
exports.getAllUsers = cb => {
  User.find({}).exec().then(users => {
    cb(users);
  });
};

exports.deleteAllUsers = cb => {
  User.remove({}).exec().then(count => {
    cb();
  });
}