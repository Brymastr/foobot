var pos = require('pos');
var chunker = require('pos-chunker');
var Message = require('./message');
var exports = module.exports = {};

exports.isTrigger = function(text) {
  return !!text.match(/(foobot)/);
};

exports.mapUpdate = function(update) {
  let message = new Message({
    update_id: update.update_id
  });
  if(update.edited_message != undefined) {
    message.message_id = update.edited_message.message_id;
    message.date = update.edited_message.date;
    message.user = update.edited_message.from;
    message.chat_id = update.edited_message.chat.id;
    message.chat_name = update.edited_message.chat.first_name;
    // message.text = update.edited_message.text;
    message.response = 'Edit that message again, I fuckin\' dare you';  // Don't care about edited messages for now
  } else if(update.message != undefined) {
    message.message_id = update.message.message_id;
    message.date = update.message.date;
    message.user = update.message.from;
    message.chat_id = update.message.chat.id;
    message.chat_name = update.message.chat.first_name;
    message.text = update.message.text;
    message.response = `Hey, ${message.user.first_name}, why don't you come say that to my face?`;
  }

  if(message.text == undefined)
    message.text = '';

  return message;
}

exports.processUpdate = function(update, cb) {
  let message = this.mapUpdate(update);
  
  if(update.edited_message != undefined) {
    cb(message);
  } else if(this.isTrigger(message.text))
    cb(message);
  else
    cb();
  
  // var text = message.text.removeWords(ignoredWords) + ' ';
  // var words = new pos.Lexer().lex(text);
  // var tags = new pos.Tagger()
  //   .tag(words)
  //   .map(function(tag) {return tag[0] + '/' + tag[1];})
  //   .join(' ');
  // var verb = tags.getWordsByTag(['VB'])[0];
  // var target = tags.getWordsByTag(['NNP', 'PRP']);
  // var meat = tags.split(target[0])[1];

  // if(target == 'me') {
  //   target = message.user;
  // }

  // return (`${verb} @${target} ${meat}`).stripTags();
};

String.prototype.getWordsByTag = function(tag) {
  var re = new RegExp('[a-zA-Z0-9]+\/(' + tag.join('|') + ') ', 'g');
  return this.match(re);
};

String.prototype.removeWords = function(find) {
  var replaceString = this;
  var regex;
  for (var i = 0; i < find.length; i++) {
    regex = new RegExp(find[i]);
    replaceString = replaceString.replace(regex, '');
  }
  return replaceString;
};

String.prototype.stripTags = function() {
  return this
    .removeWords(this.match(/\/[a-zA-Z0-9]+/g))
    .replace(/( ){2,}/, ' ');
};

var ignoredWords = [
  'please ',
  'foobot ',
  'you '
];