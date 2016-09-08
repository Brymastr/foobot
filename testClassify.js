var natural = require('natural'),  
  classifier = new natural.BayesClassifier();  
var log = require('./logger')
  
natural.BayesClassifier.load('classifier.json', null, function(err, classifier) {  
  log.debug('classifier loaded from classifier.json');
});  