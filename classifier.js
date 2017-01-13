const 
  natural = require('natural'),
  classifier = new natural.BayesClassifier(),
  log = require('./logger');

classifier.addDocument('update yourself', 'update');
classifier.addDocument('redeploy', 'update');
classifier.addDocument('new version of', 'update');
classifier.addDocument('new release for', 'update');
classifier.addDocument('basically anything else', 'else');
classifier.addDocument('lookup flights', 'flights');
classifier.addDocument('find flights', 'flights');
classifier.addDocument('find a flight', 'flights');
classifier.addDocument('flights from qqqqq to qqq qq for 1 people less than 2000', 'flights');
classifier.addDocument('track package', 'track');
classifier.addDocument('track a package by pin', 'track');
classifier.addDocument('track a package by tracking', 'track');
classifier.addDocument('track a package by tracking #########', 'track');
classifier.addDocument('track a package by tracking number 1234567891011', 'track');
classifier.addDocument('login to facebook', 'facebook login');
classifier.addDocument('can you log me in to facebook?', 'facebook login');
classifier.addDocument('log me in to facebook', 'facebook login');
classifier.addDocument('fbook login', 'facebook login');
classifier.addDocument('link my facebook account', 'facebook login');
classifier.addDocument('remember my qqqq qqqqq is wwwwww', 'member berries');
classifier.addDocument('remember my pin is 1111', 'member berries');
classifier.addDocument('remember bbbbb\'s xxxx is yyyy', 'member berries');
classifier.addDocument('what is my bike lock combination', 'member berries query');
classifier.addDocument('what is my qqqqq qqqq', 'member berries query');
classifier.addDocument('what is my hhhhhhh', 'member berries query');
classifier.addDocument('what is my address', 'member berries query');
classifier.addDocument('what is my phone number', 'member berries query');
classifier.addDocument('what is my phone number', 'member berries query');
classifier.addDocument('what is my telephone number', 'member berries query');
classifier.addDocument('what is bbbbb\'s xxxxx', 'member berries query');
classifier.addDocument('what is bbbbb\'s xxxxx yyyyy', 'member berries query');
classifier.addDocument('what is bbbbb\'s middle name', 'member berries query');
classifier.addDocument('what is my ip address', 'member berries query');
classifier.addDocument('what is my our ip address', 'member berries query');
classifier.addDocument('what is my our home ip address', 'member berries query');
classifier.addDocument('shorten this url https://www.domain.com/long/url/thing/to/shorten', 'shorten url');
classifier.addDocument('can you shorten this https://www.domain.com/long/url/thing/to/shorten', 'shorten url');
classifier.addDocument('could you shorten this', 'shorten url');
classifier.addDocument('fix this url', 'shorten url');
classifier.addDocument('this url is too long', 'shorten url');


for(i = 0; i < 20; i++)
  classifier.addDocument('any words ever', 'else');

classifier.train();

classifier.save('classifier.json', (err, classifier) => {  
  log.info('classifier trained and saved to classifier.json');
}); 