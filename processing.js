var pos = require('pos');
var chunker = require('pos-chunker');

var exports = module.exports = {};

exports.isTrigger = function(text) {
  return !!text.match(/(foobot)/);
};

exports.processMessage = function(message) {
  var text = message.text.removeWords(ignoredWords) + ' ';
  var words = new pos.Lexer().lex(text);
  var tags = new pos.Tagger()
    .tag(words)
    .map(function(tag) {return tag[0] + '/' + tag[1];})
    .join(' ');
  var verb = tags.getWordsByTag(['VB'])[0];
  var target = tags.getWordsByTag(['NNP', 'PRP']);
  var meat = tags.split(target[0])[1];

  if(target == 'me') {
    target = message.user;
  }

  return (verb + ' @' + target + meat).stripTags();
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