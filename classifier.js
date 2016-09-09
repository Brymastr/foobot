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
classifier.addDocument('hey lookup words', 'urban');
classifier.addDocument('can you lookup', 'urban');

for(i = 0; i < 50; i++)
  classifier.addDocument('any words ever', 'else');

classifier.train();

classifier.save('classifier.json', function(err, classifier) {  
  log.info('classifier trained and saved to classifier.json');
}); 