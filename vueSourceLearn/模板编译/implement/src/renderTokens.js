import lookup from './lookup'
import parseArray from './parseArray'

export default function renderTokens(tokens, data) {
  var buffer = ''
  console.log(tokens);
  let token, symbol, value;
  for(let i = 0; i < tokens.length; i++) {
    value = undefined
    token = tokens[i]
    symbol = token[0]
    if (symbol === '#') {
      value = renderSection(token, data)
    } else if (symbol === 'name') {
      value = escapedValue(token, data)
    } else if (symbol === 'text') {
      value = rawValue(token)
    }
    if (value !== undefined) {
      buffer += value
    }
  }
  return buffer
}

function renderSection(tokens, data) {
  return parseArray(tokens, data)
}
function escapedValue(token, data) {
  return lookup(data, token[1])
}
// 处理text形式
function rawValue(token) {
  return token[1];
}