/**
 * These functions are all the actions that foobot can perform. The processing module
 * decides what to do, and then forwards the request to the appropriate action in this module.
 */

const 
  google = require('./services/google'),
  canadaPost = require('./services/canadaPost'),
  urban = require('urban'),
  log = require('./logger'),
  strings = require('./strings'),
  fs = require('fs'),
  textParser = require('./textParser');


this.kanye = 'I miss the old kanye';
this.kanyeDoc = fs.readFile('./kanye.txt', 'utf-8', (err, data) => {
  if(err) data = err;
  this.kanye = data;
});

// Google QPX Flights api
exports.flights = (message, cb) => {
  google.getFlights(message, result => {
    message.response = result;
    cb(message);
  });
};

// I miss the old Kanye
exports.iMissTheOldKanye = () => {
  let kanye = this.kanye.split(/[,\n]+/).map(line => line.replace('\\', ''));
  return kanye[Math.floor(Math.random() * (kanye.length - 1))]
};

// Lookup a definition from urban dictionary
exports.define = (message, word, cb) => {
  urban(word).first(data => {
    if(!data) data = {definition: 'The library I used for Urban Dictionary lookups is having a down day, probably'}
    if(message.source == 'telegram') message.response = `*Definition:* ${data.definition}\n*Example:* ${data.example}`;
    else message.response = `Here's what Urban Dictionary has to say\n: ${data.definition}`;
    cb(message);
  });
};

// Package tracking
exports.trackPackage = (messageText, config, cb) => {
  let trackingNumber = messageText.match(/(\d|[A-Z]){10,16}/g);
  canadaPost.trackPackage(trackingNumber, config, info => {
    cb(info);
  });
};

// Facebook login
exports.facebookLogin = (config, message) => {
  message.response = strings.$('facebookLoginRequest');
  message.reply_markup = {
    inline_keyboard: [[{
      text: 'Login to Facebook',
      url: `${config.url}/auth/facebook/${message.user_id}/${message.chat_id}`
    }]]
  }

  return message;
};

// Foobot is self aware
exports.iAmFoobot = () => {
  return strings.$('meta');
};