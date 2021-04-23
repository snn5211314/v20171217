import Scanner from './Scanner'
import nestTokens from './nestTokens'

export default function parseTemplate() {
  let tokens = []
  // 创建扫描器
  var scanner = new Scanner(templateStr)

  var words;
  while(!scanner.eos()) {
    words = scanner.scanUtil('{{');
    if (words !== '') {
      tokens.push(['text', words])
    }
    scanner.scan('{{');
    words = scanner.scanUtil('}}');
    if (words !== '') {
      if (words[0] === '#') {
        tokens.push(['#', words.substring(1)])
      } else if (words[0] === '/') {
        tokens.push(['/', words.substring(1)])
      } else {
        tokens.push(['name', words])
      }
    }
    scanner.scan('}}')
  }
  return nestTokens(tokens)
}