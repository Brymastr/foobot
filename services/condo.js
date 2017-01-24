const request = require('request');

exports.open = (duration, phoneNumber, apartmentName, callback, done) => {
  request.post('https://api.niehe.ca/integrations/foobot', {
    json: {
      duration,
      callback,      
      phoneNumber,
      apartmentName,
    }
  }, (err, response, body) => {
    if(!body.apartmentName) done('Error opening the door. Maybe it\'s stuck');
    else done(`${body.apartmentName} will be unlocked for ${duration >= 60000 ? 'the next ' + Math.floor(duration / 60000) + ' minutes' : 'a few seconds'}`);
  });
};

exports.close = (phoneNumber, apartmentName, done) => {
  request.post('https://api.niehe.ca/integrations/foobot', {
    json: {
      duration: 0,
      phoneNumber,
      apartmentName,
    }
  }, (err, response, body) => {
    if(!body.apartmentName) done('Error locking the door. You should probably panic');
    else done(`${body.apartmentName} is now locked`);
  });
}