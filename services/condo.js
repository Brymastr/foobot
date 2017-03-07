const 
  request = require('request-promise-native'),
  strings = require('../strings'),
  config = require('../config.json');

exports.open = (duration, phoneNumber, apartmentName, callback, done) => {
  request.post(config.condo.url, {
    json: {
      duration,
      callback,       // Mark calls this callback so I did too to save typing. I acknowledge it makes the method parameter very confusing
      phoneNumber,
      apartmentName,
      openMessage: strings.$('doorOpen')
    }
  }).then(body => {
    if(!body.apartmentName) done('Error opening the door. Maybe it\'s stuck');
    else done(`${body.apartmentName} will be unlocked for ${duration >= 60000 ? 'the next ' + Math.floor(duration / 60000) + ' minutes' : 'a few seconds'}`);
  });
};

exports.close = (phoneNumber, apartmentName, done) => {
  request.post(config.condo.url, {
    json: {
      duration: 0,
      phoneNumber,
      apartmentName
    }
  }, (err, response, body) => {
    if(!body.apartmentName) done('Error locking the door. You should probably panic');
    else done(`${body.apartmentName} is now locked`);
  });
}