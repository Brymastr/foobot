exports.update = [
  'Do you want me to update myself?',
  'Update time!',
  'Update me like one of your french girls'
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

exports.$ = (method, str) => {
  // $ is a super hipster method name for selecting
  // a string based on a category
  // str is potential for personalization
  let list = this[method];
  let response = list[Math.floor(Math.random() * list.length)];
  return response.replace(/\${.*}/, str);
}