var natural = require('natural'),
  classifier = new natural.BayesClassifier();
var log = require('./logger');

classifier.addDocument(['laptop', 'lappy', 'desktop', 'mac', 'macbook', 'computer'], 'computers');
classifier.addDocument('update yourself', 'update');
classifier.addDocument('redeploy', 'update');
classifier.addDocument('new version of foobot', 'update');
classifier.addDocument('new release for foobot', 'update');
classifier.addDocument(['volleyball', 'vball', 'spike', 'bump', 'smash', 'beach', 'indoor'], 'volleyball');


classifier.train();

classifier.save('classifier.json', function(err, classifier) {  
  log.info('classifier trained and saved to classifier.json');
}); 