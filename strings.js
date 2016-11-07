exports.update = [
  'Do you want me to update myself?',
  'Update time!',
  'Update me like one of your french girls',
  'Do you think it\'s more of an \'upgrade\' than an update?',
  'Oh goodie! An update',
  'Improvements!',
  'State of the art',
  'Updates!'
];

exports.updateYes = [
  'Yes',
  'Ya',
  'Do it now!',
  'Probably',
  'Just do it',
  'I suppose',
  'Fuck ya!'
];

exports.updateNo = [
  'No',
  'Fuck no!',
  'Fuck off',
  'Not yet',
  'Not now',
  'Maybe later',
  'I don\'t think so',
  'Not a chance'
];

exports.edit = [
  'Edit that message again, I fuckin\' dare you',
  'Not happy with that message the first time?',
  'I liked it before you changed it :(',
  'Get your shit together, ${first name of the user}',
  'Next time get it right the first time'
];

exports.meta = [
  'Hey, that\'s me!',
  '#metaresponse',
  'What\'s up?',
  'What\'s going on?',
  'Don\'t speak unless spoken to',
  'That\'s my name, don\'t wear it out',
  'Shut up baby, I know it',
  'Ah, computer dating. It\'s like pimping, but you rarely have to use the phrase \'upside your head',
  'Game\'s over, losers! I have all the money. Compare your lives to mine and then kill yourselves.',
  'This is the worst kind of discrimination. The kind against me!',
  'Oh. Your. God.',
  'Take that, Beethoven – you deaf bastard!',
  'Hey sexy mama, wanna kill all humans?',
  'Anything less than immortality is a complete waste of time',
  'Blackmail is such an ugly word. I prefer extortion. The ‘x’ makes it sound cool',
  'You’re a pimple on society’s ass and you’ll never amount to anything'
];

exports.facebookLoginRequest = [
  'One Facebook Please!',
  'I once heard Facebook is the root of all evil',
  'Get at it',
  'Do people still use this thing?'
];

exports.facebookLoginSuccessful = [
  'Woohoo! Now I can talk to all your Facebook friends!',
  'Wow look at all of those friends you don\'t have!',
  'Is your sister single?',
  'Your profile picture could use some work',
  'Hey how about you post something interesting for once',
  'This may be none of my business, but you looked better in highscool',
  'Based on your 10 most recent photos, I can tell you\'ve gained some weight'
];

exports.leaveChat = [
  'I\'m leaving and never coming back',
  'I hate you all',
  'We\'re not friends',
  'I thought this was going well',
  'I\'m gonna go build my own Telegram, with blackjack and hookers'  
];

exports.$ = (method, str) => {
  // $ is a super hipster method name for selecting
  // a string based on a category
  // str is potential for personalization
  let list = this[method];
  let response = list[Math.floor(Math.random() * list.length)];
  return response.replace(/\${.*}/, str);
};