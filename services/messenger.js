const
  request = require('request'),
  Message = require('../models/Message'),
  log = require('../logger'),
  config = require('../config.json');

exports.conform = update => {
  update = update.entry[0].messaging[0];

  if(update.account_linking) return new Message({text: '', action: 'account linking', platform_from: {id: update.sender.id}});
  if(!update.message.text) update.message.text = '';

  let message = new Message({
    message_id: update.message.mid,
    text: update.message.text,
    chat_id: update.sender.id,
    date: update.timestamp,
    platform_from: {
      id: update.sender.id
    }
  });

  if(update.postback) message.text = 'postback';
  else if(update.optin) message.text = 'optin';

  return message;
}

exports.sendMessage = (message, done) => {
  request.post(config.messenger.url, {
    qs: {
      access_token: config.messenger.page_access_token
    },
    json: {
      recipient: {
        id: message.chat_id,
      },
      message: {
        text: message.response,
        attachment: message.reply_markup
      }
    }
  }, (err, response, body) => {
    if(err) log.error(err);    
    done(body);
  });
};

exports.sendTyping = (message, done) => {

  request.post(config.messenger.url, {
    qs: {
      access_token: config.messenger.page_access_token
    },
    json: {
      recipient: {
        id: message.chat_id,
      },
      sender_action: 'typing_on'
    }
  }, (err, response, body) => {
    if(err) log.error(err);
    done(body);
  });

};