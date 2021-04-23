import lookup from "./lookup";
import renderTokens from './renderTokens'

export default function parseArray(token, data) {
  // token是每一个token
  var v = lookup(data, token[1])
  let result = ''
  for (let i = 0; i < v.length; i++) {
    result += renderTokens(token[2], {
      ...v[i],
      '.': v[i]
    })
  }
  return result
}