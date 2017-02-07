const 
  log = require('../logger'),
  request = require('request-promise'),
  parseXml = require('xml2js-es6-promise').parseString;

exports.trackPackage = (trackingNumber, config) => {
  return new Promise((resolve, reject) => {
    request.get(`${config.canada_post.url}/${trackingNumber}/summary`, {
      headers: {
        'Accept': 'application/vnd.cpc.track+xml',
        'Authorization': config.canada_post.auth
      }
    }).then(body => {
      parseXml(body)
        .then(result => {
          try {
            resolve(result['tracking-summary']['pin-summary'][0]['event-description']);
          } catch(err) {
            reject(err);
          }
        })
        .catch(err => {
          log.error(err);
          reject(err);  
        });
    })
    .catch(err => reject(err));
  });
}