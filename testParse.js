exports.parseStringForTokens = (str, tokens) => {
  // Return a dictionary with tokens as keys and values as string
  let list = str.split(/\s+/);
  let dict = {};
  tokens.forEach(token => {
    dict[token] = this.getValueForToken(list, token, tokens);
  });
  return dict;
}

exports.getValueForToken = (list, token, tokens) => {
  let str = '';
  let index = list.indexOf(token);
  for(let i = index + 1; i < list.length; i++) {
    if(tokens.indexOf(list[i]) == -1) { // not a token
      str = str.concat(list[i] + ' ');
    } else {
      break;
    }
  }
  return str.trim();
}

console.log(this.parseStringForTokens('find flights for 2 people to vancouver from los angeles less than 200', ['to', 'from']))