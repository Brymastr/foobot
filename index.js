var mongoose = require('mongoose');
var express = require('express');
var http = require('http');
var request = require('request');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json({type:'application/vnd.api+json'}));

const token = process.env.FOOBOT_TOKEN || '223951341:AAGJXSvta7MkEEoeM3Fy3FCMjn_8ho3YV10';
const db = '//TODO: db connection';
const telegram = 'https://api.telegram.org/bot' + token;
const url = '//TODO: url of this server for the webhook to be sent to';
const port = process.env.FOOBOT_PORT || 9000;

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

var getUpdates = function(done) {
  var result = [];
  
  request.get(telegram + '/getUpdates', function(err, response, body) {
    if(err) console.log(err);
    var json = JSON.parse(body);
    for(update in json.result) {
      var message = json.result[update].message;
      var val = 'id: ' + message.message_id + '\t text: ' + message.text;
      console.log(val);
      result.push({
        id: message.message_id,
        text: message.text
      });
    }
    return done(result);
  });
}

app.post('/foobot/webhook/:token', function(req, res, next) {
  res.send('foo');
});

app.get('/foobot/updates', function(req, res) {
  getUpdates(function(result) {
    res.json(result);
  });
});

http.createServer(app).listen(port, function() {
  console.log("server listening on port " + port);
});

