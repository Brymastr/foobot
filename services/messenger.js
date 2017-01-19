const
  request = require('request'),
  Message = require('../models/Message'),
  fs = require('fs'),
  log = require('../logger');

exports.conform = update => {
  update = update.entry[0].messaging[0];
  if(!update.message.text) update.message.text = '';

  let message = new Message({
    update_id: update.message.mid,
    message_id: update.message.mid,
    text: update.message.text,
    chat_id: update.sender.id,
    date: update.timestamp,
    platform_from: {
      id: update.sender.id
    }
  });

  if(update.postback) message.text = 'postback event';
  else if(update.optin) message.text = 'optin event';

  return message;
}

exports.sendMessage = (message, config, done) => {
  request.post(config.messenger.url, {
    qs: {
      access_token: config.messenger.page_access_token
    },
    json: {
      recipient: {
        id: message.chat_id,
      },
      message: {
        text: message.response
      },
      attachment: message.reply_markup
    }
  }, (err, response, body) => {
    console.log(err, body)
    if(err) log.error(err);    
    done(body);
  });
};

exports.sendTyping = (message, config, done) => {

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