var natural = require('natural'),
  classifier = new natural.BayesClassifier();
var log = require('./logger');

classifier.addDocument(['volleyball', 'vball', 'spike', 'bump', 'smash', 'beach', 'indoor'], 'volleyball');
classifier.addDocument(['laptop', 'lappy', 'desktop', 'mac', 'macbook', 'computer'], 'computers')

classifier.train();

classifier.save('classifier.json', function(err, classifier) {  
  log.info('classifier trained and saved to classifier.json');
}); 