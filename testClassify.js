var natural = require('natural'),  
  classifier = new natural.BayesClassifier();  
var log = require('./logger')
  
natural.BayesClassifier.load('classifier.json', null, function(err, classifier) {  
  console.log('classifier loaded from classifier.json');
  console.log('\nTest phrase:\t\t', process.argv[2])
  console.log('Classification result:\t', classifier.classify(process.argv[2]));
});  