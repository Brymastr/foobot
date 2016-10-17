const log = require('../logger');
const request = require('request');
const parseXml = require('xml2js').parseString;

exports.trackPackage = (trackingNumber, cb) => {

  // TODO: make these env vars
  // const url = 'https://ct.soa-gw.canadapost.ca/vis/track/pin';
  // const auth = 'Basic NmMxODU2ODVmYzExNmI3ZDo4NDQ2ODEyYjYzNzcwMjNlZDkyMTg1';
  const url = 'https://soa-gw.canadapost.ca/vis/track/pin';
  const auth = 'Basic YzFjY2E2Y2UyMWRlMTcxZiA6YjJjNzliODJjNGIzZTJjN2E2YzA5Mw==';

  request.get(`${url}/${trackingNumber}/summary`, {
    headers: {
      'Accept': 'application/vnd.cpc.track+xml',
      'Authorization': auth
    }
  }, (err, res, body) => {
    if(err) log.error(err);
    // else log.debug(body);

    parseXml(body, function (err, result) {
      // Get a string of the description from the xml response
      let x = '';
      try {
        x = result['tracking-summary']['pin-summary'][0]['event-description'];
        cb(x);
      } catch(err) {
        x = 'No tracking info'
        cb(x);
      }
    });

  });
}