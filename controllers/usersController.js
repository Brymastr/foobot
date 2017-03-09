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

      const consolidatedUser = consolidate(user, other);
      User.create(consolidatedUser).then(consolidatedDoc => {
        console.log('AFTER SAVE')
        console.log(consolidatedDoc);
        Promise.all([
          other.remove(),
          user.remove()
        ]).then(() => resolve(consolidatedDoc));
      })

    } else {
      resolve(user);
    }
  });
});

function consolidate(user1, user2) {
  const platformIds = [...user1.platform_id, ...user2.platform_id];
  
  const user3 = Object.assign({}, user1, user2);
  user3._doc.platform_id = removeDuplicateFacebookIds(platformIds);
  if(!user3._doc.old_user_ids) user3._doc.old_user_ids = [];
  user3._doc.old_user_ids = [user1._id, user2._id];
  delete user3._doc._id;
  delete user3._doc.__v;

  console.log('BEFORE')
  console.log(user3)
  return user3._doc;
}

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