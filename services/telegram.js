var request = require('request');
var Message = require('../models/Message');
var fs = require('fs');
var log = require('../logger');

var exports = module.exports = {};

const token = process.env.FOOBOT_TOKEN || '223951341:AAGsPCHjO44E9OEHEvWMtUS3k73l4KKXoRQ';
const telegram = 'https://api.telegram.org/bot' + token;

// Send a message
exports.sendMessage = (message, done) => {
  request.post(telegram + '/sendMessage', {
    json: {
      chat_id: message.chat_id,
      text: message.response,
      reply_markup: message.reply_markup,
      parse_mode: 'Markdown'
    }
  }, (err, response, body) => {
    if(err) log.error(err);    
    return done(body);
  });
};

// Set the webhook so that messages are sent to this api
exports.setWebhook = (url = '', certPath) => {
  let formData;
  if(url != '') {
    request.post({
      url: telegram + '/setWebhook', 
      formData: {
        url: url,
        certificate: fs.readFileSync(certPath)
      }},
      function(err, response, body) {
        if(err) log.error(err);
        log.info('Webhook set: ' + url);
    });
  } else {
    request.post(
      {url: telegram + '/setWebhook'}, 
      function(err, response, body) {
        if(err) log.error(err);
        log.info(JSON.parse(body).description);
    });
  }
};

// Get updates manually when the webhook is not set
exports.getUpdates = (timeout, limit, offset, done) => {
  var result = [];
  var queryString = telegram + '/getUpdates?limit=' + limit + '&timeout=' + timeout + '&offset=' + offset;
  request.get(queryString, function(err, response, body) {
    if(err) console.log(err);
    var json = JSON.parse(body);
    if(json.result != undefined) json.result.forEach(update => result.push(update));
    return done(result);
  });
};