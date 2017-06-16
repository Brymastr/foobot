const 
  request = require('request-promise-native'),
  log = require('../logger'),
  config = require('../config.json');

exports.shorten = url => {
  return new Promise((resolve, reject) => {
    request.post(`${config.ziip.url}`, {
      json: {
        url: url
      }
    })
    .then(body => {
      if(!body.code) reject("no code");
      else resolve(body.code);
    })
    .catch(err => {
      log.error(err);
      reject(err);
    });
  });
};