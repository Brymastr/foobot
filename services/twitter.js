const
  request = require('request-promise'),
  Twitter = require('twitter'),
  config = require('../config.json'),
  schedule = require('node-schedule');

/**
 * Connect to a twitter stream. Sends an HTTP GET to the twitter api and returns a stream object
 * @param {Object} config - Configuration Object with app settings from config.js
 * @returns {stream}
 */
exports.connectStream = () => {
  return new Promise((resolve, reject) => {
    resolve();
  });
};


exports.sendTweet = status => {
  return new Promise((resolve, reject) => {
    new Twitter({
      consumer_key: config.twitter.api_key,
      consumer_secret: config.twitter.api_secret,
      access_token_key: config.twitter.access_token_key,
      access_token_secret: config.twitter.access_token_secret
    })
    .post('statuses/update', {status})
    .then(tweet => resolve(tweet.text))
    .catch(err => {
      if(err[0].code == 187) reject(187);
      else reject(err);
    });
  });
};

exports.scheduleTweet = () => {
  let rule = new schedule.RecurrenceRule();
  rule.hour = 10;
  rule.minute = 30;
  schedule.scheduleJob(rule, () => {
    async.retry({
      times: 5,
      interval: 2000,
      errorFilter: err => err === 187
    }, (cb, results) => {
      this.sendTweet(require('../strings').$('tweet'))
        .then(tweet => {
          log.info(`Tweet sent: ${tweet}`);
          cb(tweet);
        })
        .catch(err => cb(new Error(err)));
    });
  });
};
