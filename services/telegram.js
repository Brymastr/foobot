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
  if(config.url) {
    request.post({
      url: `${config.telegram.url}${config.telegram.token}/setWebhook`,
      formData: {
        url: config.url + config.route_token,
        certificate: fs.readFileSync(config.cert_path)
      }},
      (err, response, body) => {
        if(err) log.error(err);
        log.info('Webhook set: ' + url);
    });
  } else {
    request.post({
      url: `${config.telegram.url}${config.telegram.token}/setWebhook`}, 
      (err, response, body) => {
        if(err) log.error(err);
        log.info(JSON.parse(body).description);
      }
    );
  }
};

// Get updates manually when the webhook is not set
exports.getUpdates = (timeout, limit, offset, config, done) => {
  let result = [];
  let queryString = `${config.telegram.url}${config.telegram.token}/getUpdates?limit=${limit}&timeout=${timeout}&offset=${offset}`;
  request.get(queryString, function(err, response, body) {
    if(err) console.log(err);
    let json = JSON.parse(body);
    if(json.result != undefined) json.result.forEach(update => result.push(update));
    done(result);
  });
};

exports.schedule = (config) => {
  natural.BayesClassifier.load('classifier.json', null, (err, classifier) => { 
    schedule.scheduleJob('0 * * * * *', () => {
      this.getUpdates(50, 5, -5, config, updates => {
        updates.forEach(update => {
          processing.processUpdate(update, classifier, (response) => {
            this.sendMessage(response, config, () => {
              // Send a getUpdates with higher offset to mark all as read
              this.getUpdates(0, 1, update.update_id + 1, config, () => {});
            });
          });
        });
      });
    });
    log.info('getUpdates()');
  });
}