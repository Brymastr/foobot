const
  request = require('request'),
  Message = require('../models/Message'),
  fs = require('fs'),
  log = require('../logger');

exports.conform = update => {
  console.dir(update);
  update = update.entry[0].messaging[0];
  let message = new Message({
    update_id: update.message.mid,
    message_id: update.message.mid, // not sure what I need message_id for vs update_id
    text: update.message.text,
    chat_id: update.sender.id,
    date: update.timestamp
  });

  if(update.messagingEvent.postback) message.text = 'postback event';
  else if(update.messagingEvent.optin)

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
        text: message.text
      }
    }
  }, (err, response, body) => {
    if(err) log.error(err);    
    done(body);
  });
};