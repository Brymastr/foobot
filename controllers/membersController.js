const 
  log = require('../logger'),
  Member = require('../models/Member');

exports.saveMember = (message, cb) => {
  let member = message.text.split(/(remember|member)/i)[2].split('is').map(x => x.trim());
  new Member({
    user_id: message.user_id,
    thing: member[0],
    value: member[1]
  }).save((err, _member) => {
    cb(_member);
  });
};

exports.recall = (message, cb) => {
  let remembery = message.text.split('is')[1].trim();
  Member.find({user_id: message.user_id, thing: remembery}, (err, rememberies) => {
    if(rememberies && !err) cb(rememberies[0].value);
    else cb();
  });
};