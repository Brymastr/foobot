const 
  natural = require('natural'),
  Tagger = natural.BrillPOSTagger,
  tokenizer = new natural.WordTokenizer();

var base_folder = "../node_modules/natural/lib/natural/brill_pos_tagger/data/English";
var rules_file = base_folder + "/tr_from_posjs.txt";
var lexicon_file = base_folder + "/lexicon_from_posjs.json";
var default_category = 'N';

var tagger = new Tagger(lexicon_file, rules_file, default_category, function(error) {
  if (error) {
    console.log(error);
  }
  else {
    var sentence = tokenizer.tokenize('Welcome to the world of tomorrow');
    console.log(JSON.stringify(tagger.tag(sentence)));
  }
});