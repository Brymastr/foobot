const
  request = require('request-promise'),
  Twitter = require('twitter');

/**
 * Connect to a twitter stream. Sends an HTTP GET to the twitter api and returns a stream object
 * @param {Object} config - Configuration Object with app settings from config.js
 * @returns {stream}
 */
exports.connectStream = (config) => {
  return new Promise((resolve, reject) => {
    resolve();
  });
};


exports.sendTweet = (config, status) => {
  return new Promise((resolve, reject) => {
    var twitter = new Twitter({
      consumer_key: config.twitter.api_key,
      consumer_secret: config.twitter.api_secret,
      access_token_key: config.twitter.access_token_key,
      access_token_secret: config.twitter.access_token_secret
    });
    twitter
      .post('statuses/update', {status})
      .then(tweet => {
        resolve(tweet.text);
      })
      .catch(err => {
        if(err[0].code == 187) reject(187);
        else reject(err);
      });
  });
};