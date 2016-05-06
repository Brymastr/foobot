module.exports = function() {

  this.CLAUSE = {
    ruleType: 'tokens',
    pattern: '[ { chunk:NP } ] [ { chunk:VP } ]',
    result: 'CLAUSE'
  };

  this.VP = {
    ruleType: 'tokens',
    pattern: '[ { tag:/VB.*?/ } ] [ { chunk:/NP|PP/ } ]+',
    result: 'VP'
  };

  this.PP = {
    ruleType: 'tokens',
    pattern: '[ { tag:IN } ] [ { chunk:NP } ]',
    result: 'PP'
  };

  this.NP = {
    ruleType: 'tokens',
    pattern: '[ { tag:/DT|JJ|NN.*?/ } ]+',
    result: 'NP'
  };
};