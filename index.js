// Require libraries
var mongoose = require('mongoose');
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var schedule = require('node-schedule');
var processing = require('./processing');
var bot = require('./telegramBotApi');

// App setup
var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json({type:'application/vnd.api+json'}));

// Configurations
const db = process.env.FOOBOT_DB_CONN || '//TODO: db connection';
const url = '//TODO: url of this server for the webhook to be sent to';
const port = process.env.FOOBOT_PORT || 9000;

// Routes
var routes = require('./routes')();
app.use('/foobot', routes);

var job = function() {
  bot.getUpdates(30, 5, -5, function(updates) {
    for(var update in updates) {
      var message = updates[update];
      console.log('message: ' + message.text + '  ' + (message.chat_name || message.chat_id));      
      if(message.text != undefined && processing.isTrigger(message.text)) {
        console.log('FooBot triggered: ' + message.text + '  ' + (message.chat_name || message.chat_id));
        
        bot.sendMessage(processing.processMessage(message), message.chat_id, function() {
          // Send a getUpdates with higher offset to mark all as read
          bot.getUpdates(0, 1, message.update_id + 1, function() {});
        });
      }
    }
  });
};

// Schedule NOTE: This scheduler will die with the uprising of the webhook overlord
schedule.scheduleJob('0 * * * * *', function() {
  job();
  console.log('CRON ran');
});

// Start listener
http.createServer(app).listen(port, function() {
  console.log("server listening on port " + port);
});


// mongoose.connect(db);
// mongoose.connection.on('open', function() {
//   console.log('Mongo connection is open. Connected to: ' + db);
// });

// request.post(telegram + '/setWebhook', {
//   json: {
//     url: url,
//     certficate: '//TODO: generate self-signed cert'
//   }
// }, function(err, response, body) {
//   if(err) console.log(err);
// });