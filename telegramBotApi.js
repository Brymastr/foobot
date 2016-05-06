var request = require('request');

var exports = module.exports = {};

const token = process.env.FOOBOT_TOKEN || '223951341:AAGJXSvta7MkEEoeM3Fy3FCMjn_8ho3YV10';
const telegram = 'https://api.telegram.org/bot' + token;

// Send a text message
exports.sendMessage = function(message, chatId, done) {
  request.post(telegram + '/sendMessage', {
    json: {
      chat_id: chatId,
      text: message
    }
  }, function(err, resonse, body) {
    if(err) console.log(err);
    return done(body);
  });
}

// Get all updates from telegram bot api
exports.getUpdates = function(timeout, limit, offset, done) {
  var result = [];
  request.get(telegram + '/getUpdates?limit=' + limit + '&timeout=' + timeout + '&offset=' + offset, function(err, response, body) {
    if(err) console.log(err);
    var json = JSON.parse(body);
    for(update in json.result) {
      var message = json.result[update].message;
      var val = 'id: ' + message.message_id + '\t text: ' + message.text;
      result.push({
        id: message.message_id,
        text: message.text,
        date: message.date,
        user: message.from.first_name || message.from.username,
        chat_id: message.chat.id,
        chat_name: message.chat.title,
        update_id: json.result[update].update_id
      });
    }
    return done(result);
  });
}