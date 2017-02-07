const 
  natural = require('natural'),
  classifier = new natural.BayesClassifier(),
  log = require('./logger');

// Updating
classifier.addDocument('update yourself', 'update');
classifier.addDocument('redeploy', 'update');
classifier.addDocument('new version of', 'update');
classifier.addDocument('new release for', 'update');

// Flight searching
classifier.addDocument('lookup flights', 'flights');
classifier.addDocument('find flights', 'flights');
classifier.addDocument('find a flight', 'flights');
classifier.addDocument('flights from qqqqq to qqq qq for 1 people less than 2000', 'flights');

// Package tracking
classifier.addDocument('track package', 'track package');
classifier.addDocument('track a package by pin', 'track package');
classifier.addDocument('track a package by tracking', 'track package');
classifier.addDocument('track a package by tracking #########', 'track package');
classifier.addDocument('track a package by tracking number 1234567891011', 'track package');

// Facebook account linking
classifier.addDocument('login to facebook', 'facebook login');
classifier.addDocument('can you log me in to facebook?', 'facebook login');
classifier.addDocument('log me in to facebook', 'facebook login');
classifier.addDocument('fbook login', 'facebook login');
classifier.addDocument('link my facebook account', 'facebook login');

// Foobot memory "Member Berries" (South Park reference)
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

// URL shortening
classifier.addDocument('shorten this url https://www.domain.com/long/url/thing/to/shorten', 'shorten url');
classifier.addDocument('can you shorten this https://www.domain.com/long/url/thing/to/shorten', 'shorten url');
classifier.addDocument('could you shorten this', 'shorten url');
classifier.addDocument('fix this url', 'shorten url');
classifier.addDocument('this url is too long', 'shorten url');

// Condo entry
classifier.addDocument('link my condo entry account', 'condo entry setup');
classifier.addDocument('setup my condo account', 'condo entry setup');
classifier.addDocument('I want to be able to unlock my condo', 'condo entry setup');
classifier.addDocument('link my apartment entry account', 'condo entry setup');
classifier.addDocument('connect my condo account', 'condo entry setup');
classifier.addDocument('allow access to my condo for ten minutes', 'condo entry access');
classifier.addDocument('allow access to my apartment for ten minutes', 'condo entry access');
classifier.addDocument('allow access to my apartment for five minutes', 'condo entry access');
classifier.addDocument('open my door', 'condo entry access');
classifier.addDocument('open my door for five minutes', 'condo entry access');
classifier.addDocument('unlock my door for five minutes', 'condo entry access');
classifier.addDocument('unlock my apartment for five minutes', 'condo entry access');
classifier.addDocument('unlock my condo for five minutes', 'condo entry access');
classifier.addDocument('lock my condo', 'condo entry lock');
classifier.addDocument('lock my apartment', 'condo entry lock');
classifier.addDocument('lock my door', 'condo entry lock');
classifier.addDocument('close my condo', 'condo entry lock');
classifier.addDocument('close my door', 'condo entry lock');
classifier.addDocument('close my apartment', 'condo entry lock');


// Something to make some phrases less picky. Else is for classifier inaccuracies 
for(i = 0; i < 20; i++) classifier.addDocument('any words ever', 'else');
classifier.addDocument('when I was doing track', 'else');
classifier.addDocument('get my life back on track', 'else');
classifier.addDocument('keep track of my spending habbits', 'else');
classifier.addDocument('https://www.imaginaryurl.com/long/path?maybe-some-query-vars=ok&stuff=iguess', 'else');
classifier.addDocument('https://www.youtube.com/watch?v=9g2oMlszdwY', 'else');
classifier.addDocument('other words that go before this url https://www.youtube.com/watch?v=9g2oMlszdwY', 'else');
classifier.addDocument('I feel like The Dropship: The 100 Podcast sounds pretty good, what do you think? https://www.youtube.com/watch?v=9g2oMlszdwY', 'else');
classifier.addDocument('basically anything else', 'else');

// Train the classifier
classifier.train();

// Save the trained model to classifier.json
classifier.save('classifier.json', (err, classifier) => {  
  log.info('classifier trained and saved to classifier.json');
}); 