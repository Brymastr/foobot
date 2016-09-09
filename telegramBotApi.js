var request = require('request');
var Message = require('./models/Message');
var fs = require('fs');
var log = require('./logger');

var exports = module.exports = {};

const token = process.env.FOOBOT_TOKEN || '223951341:AAGsPCHjO44E9OEHEvWMtUS3k73l4KKXoRQ';
const telegram = 'https://api.telegram.org/bot' + token;

// Send a text message
exports.sendMessage = function(message, chatId, replyMarkup, done) {
  request.post(telegram + '/sendMessage', {
    json: {
      chat_id: chatId,
      text: message,
      reply_markup: replyMarkup
    }
  }, function(err, response, body) {
    if(err) log.error(err);    
    return done(body);
  });
};

exports.setWebhook = function(url = '', certPath) {
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

// Get all updates from telegram bot api
exports.getUpdates = function(timeout, limit, offset, done) {
  var result = [];
  var queryString = telegram + '/getUpdates?limit=' + limit + '&timeout=' + timeout + '&offset=' + offset;
  request.get(queryString, function(err, response, body) {
    if(err) console.log(err);
    var json = JSON.parse(body);
    for(update in json.result) {
      var message = json.result[update].message;
      var val = 'id: ' + message.message_id + '\t text: ' + message.text;
      result.push(new Message({
        message_id: message.message_id,
        text: message.text,
        date: message.date,
        user: message.from.first_name || message.from.username,
        chat_id: message.chat.id,
        chat_name: message.chat.title,
        update_id: json.result[update].update_id
      }));
    }
    return done(result);
  });
};