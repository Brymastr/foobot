var natural = require('natural'),
  classifier = new natural.BayesClassifier();
var log = require('./logger');

classifier.addDocument('my computer', 'computers');
classifier.addDocument('this comp', 'computers');
classifier.addDocument('my laptop', 'computers');
classifier.addDocument('your computer laptop', 'computers');
classifier.addDocument('update yourself', 'update');
classifier.addDocument('redeploy', 'update');
classifier.addDocument('new version of', 'update');
classifier.addDocument('new release for', 'update');
classifier.addDocument('let\'s play vball', 'volleyball');
classifier.addDocument('let\'s vball', 'volleyball');
classifier.addDocument('let\'s play', 'volleyball');
classifier.addDocument('volleyball tonight', 'volleyball');
classifier.addDocument('dropin at bonsor', 'volleyball');
classifier.addDocument('dropin at bonsor', 'volleyball');
classifier.addDocument('basically anything else', 'else');
classifier.addDocument('lookup flights', 'flights');
classifier.addDocument('find flights', 'flights');
classifier.addDocument('find a flight', 'flights');
classifier.addDocument('flights from qqqqq to qqq qq for 1 people less than 2000', 'flights');
classifier.addDocument('track package', 'track');
classifier.addDocument('track a package by pin', 'track');
classifier.addDocument('track a package by tracking number', 'track');
classifier.addDocument('track a package by tracking number #########', 'track');
classifier.addDocument('track a package by tracking number 1234567891011', 'track');
classifier.addDocument('login to facebook', 'facebook login');
classifier.addDocument('I want to log in to facebook', 'facebook login');
classifier.addDocument('hey foobot can you log me in to facebook?', 'facebook login');
classifier.addDocument('please log me in to facebook', 'facebook login');
classifier.addDocument('fbook login', 'facebook login');
classifier.addDocument('please link my facebook account', 'facebook login');



for(i = 0; i < 50; i++)
  classifier.addDocument('any words ever', 'else');

classifier.train();

classifier.save('classifier.json', (err, classifier) => {  
  log.info('classifier trained and saved to classifier.json');
}); 