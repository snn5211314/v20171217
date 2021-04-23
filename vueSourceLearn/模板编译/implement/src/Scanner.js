export default class Scanner {
  constructor(templateStr) {
    // 转存源字符模板
    this.templateStr = templateStr;
    // 剩余字符模板，默认是和源一样
    this.tail = templateStr;
    // 指针
    this.pos = 0;
  }

  scan(tag) {
    if (this.tail.indexOf(tag) === 0) {
      this.pos += tag.length;
      this.tail = this.tail.substring(tag.length);
    }
  }

  scanUtil(stopTag) {
    var startPos = this.pos;
    while (!this.eos() && this.tail.indexOf(stopTag) !== 0) {
      this.pos++;
      this.tail = this.templateStr.substring(this.pos);
    }
    return this.templateStr.substring(startPos, this.pos);
  }

  // 判断是否越界
  eos() {
    return this.pos >= this.templateStr.length;
  }
}