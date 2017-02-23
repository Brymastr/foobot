const
  log = require('../logger'),
  User = require('../models/User'),
  Message = require('../models/Message');

exports.createUser = (data, cb) => {
  new User({
    first_name: data.first_name,
    last_name: data.last_name,
    telegram_id: data.telegram_id,
    messenger_id: data.messenger_id
  }).save((err, user) => {
    if (err) log.err(`Error creating user: ${err}`);
    else log.debug(`User created: ${user}`);
    cb(user);
  });
};

exports.getUser = id => {
  return new Promise(resolve => {
    User.findOne({ _id: id }).exec().then(resolve);
  });
};

exports.getUserByPlatformId = (id, cb) => {
  User.findOne({ $or: [{ 'telegram_id': id }, { 'messenger_id': id }, { 'facebook_id': id }] }, (err, user) => {
    cb(user);
  });
};

exports.consolidateUsers = (user, cb) => {
  User.findOne({facebook_id: user.facebook_id, _id: {$ne: user._id}}, (err, other) => {
    if(other) {
      if(!other.messenger_id) other.messenger_id = user.messenger_id;
      if(!other.telegram_id) other.telegram_id = user.telegram_id;
      if(!other.gender) other.gender = user.gender;
      if(!other.phone_number) other.phone_number = user.phone_number;
      if(!other.email) other.email = user.email;
      if(!other.username) other.username = user.username;
      other.old_account_ids.push(user._id);
      other.save((err, otherDoc) => {
        user.remove((err, thisDoc) => {
          cb(otherDoc);
        });
      });
    } else {
      cb(user);
    }
  });
};

exports.savePhoneNumber = (message, cb) => {
  User.findOne({_id: message.user_id}, (err, user) => {
    if(message.other.contact_telegram_id == user.telegram_id && user.action == 'phone_number') {
      user.phone_number = message.text.substr(1) === '+' ? message.text : '+' + message.text;
      user.action = null;
      user.save((err, doc) => {
        message.response = 'Condo account linked';
        cb(message);
      });
    } else cb(message);
    
  });
};

// Don't keep this
exports.getAllUserIds = cb => {
  User.find({}, 'telegram_id messenger_id facebook_id', (err, users) => {
    cb(users);
  });
};

// Or this
exports.getAllUsers = cb => {
  User.find({}, (err, users) => {
    cb(users);
  });
};

exports.deleteAllUsers = cb => {
  User.remove({}, (err, count) => {
    cb();
  });
}