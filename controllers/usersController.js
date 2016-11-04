const
  log = require('../logger'),
  User = require('../models/User');

exports.createUser = (data, cb) => {
  new User({
    first_name: data.first_name,
    last_name: data.last_name,
    telegram_id: data.telegram_id
  }).save((err, user) => {
    if(err) log.err(`Error creating user: ${err}`);
    else log.debug(`User created: ${user}`);
    cb(user);
  })
}

exports.getUser = (id, cb) => {
  User.find({_id: id}, (err, user) => {
    cb(user);
  });
};

exports.getUserByPlatformId = (id, cb) => {
  User.findOne({$or: [{'telegram_id': id}]}, (err, user) => {
    cb(user);
  });
}