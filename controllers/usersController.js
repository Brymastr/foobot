const
  log = require('../logger'),
  User = require('../models/User'),
  Message = require('../models/Message');

exports.createUser = (data, cb) => {
  new User({
    first_name: data.first_name,
    last_name: data.last_name,
    telegram_id: data.telegram_id
  }).save((err, user) => {
    if (err) log.err(`Error creating user: ${err}`);
    else log.debug(`User created: ${user}`);
    cb(user);
  });
};

exports.getUser = (id, cb) => {
  User.findOne({ _id: id }, (err, user) => {
    cb(user);
  });
};

exports.getUserByPlatformId = (id, cb) => {
  User.findOne({ $or: [{ 'telegram_id': id }] }, (err, user) => {
    cb(user);
  });
};

exports.consolidateUsers = (facebook_id, user_id, cb) => {
  User.findOne({ facebook_id: facebook_id, _id: { $ne: user_id } }, (err, user) => {
    Message.update({user_id: user._id}, {$set: {user_id: user_id}}, {multi: true}, (err, docs) => {
      log.debug(`${docs.length} messages updated`);
      cb();
    });
  });
};