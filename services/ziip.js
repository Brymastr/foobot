const 
  request = require('request-promise'),
  log = require('../logger');

exports.shorten = (url, config) => {
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