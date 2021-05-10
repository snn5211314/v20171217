import { mount } from "./compiler";
import { initState } from "./state";

function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this
    vm.$options = options
    // vue的初始化
    if(options.data) { // 进行数据处理
      initState(vm)
    }
    if (options.el) {
      mount(options.el)
    }
  }
}

export default initMixin;