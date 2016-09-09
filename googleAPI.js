const log = require('./logger');
const request = require('request');
const textParser = require('./textParser');

exports.getFlights = (message, cb) => {
  const key = process.FOOBOT_GOOGLE_FLIGHTS_KEY || 'AIzaSyAETu5_M7s9w8a1g2YE-FwBuHvbTHP1u7A';
  let dict = textParser.parseStringForTokens(message.text, ['from', 'to', 'for', 'on', 'less']);
  // check mandatory fields
  // parse date

  request.post(`https://www.googleapis.com/qpxExpress/v1/trips/search?key=${key}`, {
    json: {
      "request": {
        "passengers": {
          "kind": "qpxexpress#passengerCounts",
          "adultCount": parseInt(dict.for) || 1
        },
        "slice": [
          {
            "kind": "qpxexpress#sliceInput",
            "origin": dict.from,
            "destination": dict.to,
            "date": new Date(dict.on)
          }
        ],
        "maxPrice": dict.less,
        "saleCountry": 'Canada',
        "ticketingCountry": 'Canada',
        "solutions": 2
      }
    }
  }, (err, response, body) => {
    if(err) log.error(err);
    else log.debug(body);
    cb(body);
  });
}