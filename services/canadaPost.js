const log = require('../logger');
const request = require('request');
const parseXml = require('xml2js').parseString;

exports.trackPackage = (trackingNumber, cb) => {
  request.get(`${config.canadaPost.url}/${trackingNumber}/summary`, {
    headers: {
      'Accept': 'application/vnd.cpc.track+xml',
      'Authorization': config.canadaPost.auth
    }
  }, (err, res, body) => {
    if(err) log.error(err);

    parseXml(body, function (err, result) {
      // Get a string of the description from the xml response
      try {
        cb(result['tracking-summary']['pin-summary'][0]['event-description']);
      } catch(err) {
        cb('No tracking info');
      }
    });

  });
}