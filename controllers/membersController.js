const 
  log = require('../logger'),
  Member = require('../models/Member');

exports.saveMember = (message, cb) => {
  let member = s.split(/(remember|member)/i)[2].split('is').map(x => x.trim());
  new Member({
    user_id: message.user_id,
    thing: member[0],
    value: member[1]
  }).save((err, _member) => {
    cb(_member);
  });
};