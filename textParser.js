// Return a dictionary with tokens as keys and values as string
exports.parseStringForTokenValues = (str, tokens) => {
  let list = str.split(/\s+/);
  let dict = {};
  tokens.forEach(token => {
    dict[token] = this.getValueForToken(list, token, tokens);
  });
  return dict;
}

// Return a dictionary with target tokens found in string
exports.parseStringForTokens = (str, tokens) => {
  let found = [];
  tokens.forEach(token => {
    if(str.indexOf(token) > -1)
      found.push(token);
  });
  return found;
};

exports.getValueForToken = (list, token, tokens) => {
  let str = '';
  let index = list.indexOf(token);
  for(let i = index + 1; i < list.length; i++) {
    if(tokens.indexOf(list[i]) == -1) // not a token
      str = str.concat(list[i] + ' ');
    else break;
  }
  return str.trim();
}