var pos = require('pos');
var chunker = require('pos-chunker');

const disturbed = 
`No mommy, don't do it again
Don't do it again
I'll be a good boy
I'll be a good boy, I promise
No mommy don't hit me
Why did you have to hit me like that, mommy?
Don't do it, you're hurting me
Why did you have to be such a bitch

Why don't you
Why don't you just fuck off and die
Why can't you just fuck off and die
Why can't you just leave here and die
Never stick your hand in my face again bitch
Fuck you
I don't need this shit
You stupid sadistic abusive fucking whore
How would you like to see how it feels mommy
Here it comes, get ready to die`;

var exports = module.exports = {};

exports.isTrigger = function(text) {
  return !!text.match(/(foobot)/);
};

exports.processMessage = function(message, cb) {
  cb(disturbed);
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

  // return (verb + ' @' + target + meat).stripTags();
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