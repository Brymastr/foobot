const 
  request = require('request'),
  log = require('../logger');

exports.shorten = (url, config, done) => {
  request.post(`${config.ziip.url}`, {
    json: {
      url: url
    }
  }, (err, response, body) => {
    if(err || !body.code) {
      log.error(err);
      done('There\'s nothing for you here.');
    } else done(body.code);
  });
};