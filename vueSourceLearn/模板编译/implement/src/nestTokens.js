/*
  处理tokens变成完成的tokens
*/
export default function nestTokens(tokens) {
  // 处理后的结果
  let nestTokens = []
  // 当前处理的token
  let collector = nestTokens
  // 数据栈结构
  let sections = []
  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i]
    switch (token[0]) {
      case '#':
        // 往收集器中添加token
        collector.push(token)
        // 入栈
        sections.push(token)
        // 设置为token第3项是一个空数组，但是后期会处理成tokens结构
        collector = token[2] = []
        break;
      case '/':
        // 出栈
        let section_pop = sections.pop()
        // 改变收集器，如果栈中有数据，就指向栈中最后一位token的第3项，没有数据就是顶层的token
        collector = sections.length > 0 ? sections[sections.length - 1][2] :  nestTokens
        break;
      default:
        collector.push(token)
    }
  }
  return nestTokens
}
