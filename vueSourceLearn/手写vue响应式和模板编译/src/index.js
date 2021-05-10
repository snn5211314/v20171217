import initMixin from "./initMixin";

function Vue(options) { // Vue的构造函数
  this._init(options)
}

initMixin(Vue)

export default Vue;