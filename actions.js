/**
 * These functions are all the actions that foobot can perform. The processing module
 * decides what to do, and then forwards the request to the appropriate action in this module.
 */

const googleAPI = require('./services/google');
const canadaPost = require('./services/canadaPost');
const urban = require('urban');
const log = require('./logger');
const strings = require('./strings');
const textParser = require('./textParser');

const fs = require('fs');


this.kanye = 'I miss the old kanye';
this.kanyeDoc = fs.readFile('./kanye.txt', 'utf-8', (err, data) => {
  if(err) data = err;
  this.kanye = data;
});

// Google QPX Flights api
exports.flights = (message, cb) => {
  googleAPI.getFlights(message, result => {
    message.response = result;
    cb(message);
  });
};

// I miss the old Kanye
exports.iMissTheOldKanye = () => {
  let kanye = this.kanye.split(/[,\n]+/).map(line => line.replace('\\', ''));
  return kanye[Math.floor(Math.random() * (kanye.length - 1))]
};

// Update foobot
exports.update = (message) => {
  message.response = strings.$('update');
  message.reply_markup = {
    inline_keyboard: [[
      new InlineKeyboardButton({
        text: strings.$('updateYes'),
        callback_data: 'confirm'
      }),
      new InlineKeyboardButton({
        text: strings.$('updateNo'),
        callback_data: 'deny'
      })
    ]]
  }
  return message;
};

// Lookup a definition from urban dictionary
exports.define = (message, word, cb) => {
  urban(word).first(data => {
    if(data == undefined) data = {definition: 'The library I used for Urban Dictionary lookups is having a down day, probably', example: 'No example'}
    message.response = `*Definition:* ${data.definition}\n*Example:* ${data.example}`;
    cb(message);
  });
};

exports.trackPackage = (messageText, cb) => {
  let trackingNumber = messageText.match(/(\d|[A-Z]){10,16}/g);
  canadaPost.trackPackage(trackingNumber, (info) => {
    cb(info);
  });
}

// Foobot is self aware
exports.iAmFoobot = () => {
  return strings.$('meta');
}