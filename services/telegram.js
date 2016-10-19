const 
  request = require('request'),
  Message = require('../models/Message'),
  fs = require('fs'),
  log = require('../logger'),
  natural = require('natural'),
  processing = require('../processing'),
  schedule = require('node-schedule');

// Send a message
exports.sendMessage = (message, config, done) => {
  request.post(`${config.telegram.url}${config.telegram.token}/sendMessage`, {
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
exports.setWebhook = (config) => {
  let formData;
  try {
    formData = {
      url: `${config.url}/${config.route_token}`,
      certificate: fs.readFileSync(config.cert_path)
    };
  } catch(err) {
    formData = {
      url: `${config.url}/${config.route_token}`
    };
  }

  request.post({
    url: `${config.telegram.url}${config.telegram.token}/setWebhook`,
    formData: formData
  }, (err, response, body) => {
    if(err) log.error(err);
    log.info(`Webhook set: ${config.url}/${config.route_token}`);
  });
};