const 
  request = require('request'),
  Message = require('../models/Message'),
  fs = require('fs'),
  log = require('../logger'),
  natural = require('natural'),
  processing = require('../processing');

// Send a message
exports.sendMessage = (message, config, done) => {
  request.post(`${config.telegram.url}${config.telegram.token}/sendMessage`, {
    json: {
      chat_id: message.chat_id,
      text: message.response,
      reply_markup: message.reply_markup,
      reply_to_message_id: message.reply_to,
      parse_mode: 'Markdown'
    }
  }, (err, response, body) => {
    if(err) log.error(err);    
    done(body);
  });
};

exports.editMessage = (message, config, done) => {
  request.post(`${config.telegram.url}${config.telegram.token}/editMessageText`, {
    json: {
      chat_id: message.chat_id,
      text: message.text,
      reply_markup: message.reply_markup,
      parse_mode: 'Markdown'
    }
  }, (err, response, body) => {
    if(err) log.error(err);    
    done(body);
  });
}

// Set the webhook so that messages are sent to this api
exports.setWebhook = config => {
  let formData;
  const url = `${config.url}/webhook/telegram/${config.route_token}`;
  try {
    formData = {
      url: url,
      certificate: fs.readFileSync(config.cert_path)
    };
  } catch(err) {
    formData = {
      url: url
    };
  }

  request.post({
    url: `${config.telegram.url}${config.telegram.token}/setWebhook`,
    formData: formData
  }, (err, response, body) => {
    if(err) log.error(err);
    log.info(`Telegram webhook set: ${url}`);
  });
  
};

exports.leaveChat = (chat_id, config, done) => {
  request.post(`${config.telegram.url}${config.telegram.token}/leaveChat`, {
    json: {
      chat_id: chat_id
    }
  }, (err, response, body) => {
    if(err) log.error(err);    
    done(body);
  });
};

// Make the message into a local message without nulls
exports.conform = update => {
  let message = new Message({
    update_id: update.update_id
  });
  if(update.edited_message != undefined) {
    message.message_id = update.edited_message.message_id;
    message.date = update.edited_message.date;
    message.platform_from = update.edited_message.from;
    message.chat_id = update.edited_message.chat.id;
    message.chat_name = update.edited_message.chat.first_name;
    message.action = 'edit';
  } else if(update.message != undefined) {
    message.message_id = update.message.message_id;
    message.date = update.message.date;
    message.platform_from = update.message.from;
    message.chat_id = update.message.chat.id;
    message.chat_name = update.message.chat.first_name;
    message.text = update.message.text;
  } else if(update.callback_query != undefined) {
    message.message_id = update.callback_query.message.message_id;
    message.platform_from = update.callback_query.from;
    message.chat_id = update.callback_query.message.chat.id;
    message.chat_name = update.callback_query.message.chat.first_name;
    message.text = update.callback_query.message.text;
    message.action = update.callback_query.data;
  }

  if(message.text == undefined)
    message.text = '';

  return message;
}