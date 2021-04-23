import parseTemplate from './parseHtml2Tokens'
import renderTokens from './renderTokens'

var SSG_TemplateEngine = {
  render(templateStr, data) {
    // 将模板转换成tokens
    let tokens = parseTemplate(templateStr)
    // 将tokens和data结合生成模板
    let domStr = renderTokens(tokens, data)
    return domStr
  }
}
window.SSG_TemplateEngine = SSG_TemplateEngine