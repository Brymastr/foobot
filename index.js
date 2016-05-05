// Require libraries
var mongoose = require('mongoose');
var express = require('express');
var http = require('http');
var request = require('request');
var bodyParser = require('body-parser');
var schedule = require('node-schedule');

// App setup
var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json({type:'application/vnd.api+json'}));

// Configurations
const token = process.env.FOOBOT_TOKEN || '223951341:AAGJXSvta7MkEEoeM3Fy3FCMjn_8ho3YV10';
const db = process.env.FOOBOT_DB_CONN || '//TODO: db connection';
const telegram = 'https://api.telegram.org/bot' + token;
const url = '//TODO: url of this server for the webhook to be sent to';
const port = process.env.FOOBOT_PORT || 9000;


// Function to get all updates from telegram bot api
var getUpdates = function(done, timeout, limit) {
  var result = [];
  request.get(telegram + '/getUpdates?limit=' + limit + '&timeout = ' + timeout, function(err, response, body) {
    if(err) console.log(err);
    var json = JSON.parse(body);
    for(update in json.result) {
      var message = json.result[update].message;
      var val = 'id: ' + message.message_id + '\t text: ' + message.text;
      console.log(val);
      result.push({
        id: message.message_id,
        text: message.text,
        date: message.date,
        user: message.from.first_name || message.from.username
      });
    }
    return done(result);
  });
}

var sendMessage = function(message, done) {
  console.log(message);  
  request.post(telegram + '/sendMessage', {
    json: {
      chat_id: -118475537,
      text: message
    }
  }, function(err, resonse, body) {
    if(err) console.log(err);
    console.log(body);
    return done(body);
  });
}

// Routes
app.post('/foobot/send', function(req, res, next) {
  sendMessage(req.body.message, function() {
    res.send('message sent: ' + req.body.message);
  });
});

app.post('/foobot/webhook/:token', function(req, res, next) {
  res.send('foo');
});

app.get('/foobot/updates', function(req, res) {
  getUpdates(function(updates) {
    res.json(updates);
  }, 0, 10);
});

// Schedule
schedule.scheduleJob('0 * * * * *', function() {
  getUpdates(function(updates) {
    for(update in updates) {
      if(updates[update].text.match(/(hey foobot)/)) {
        sendMessage('I am here to serve', function() {
          console.log('CRON ran');
        });
        break;
      }
    }
  }, 10, 5);
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