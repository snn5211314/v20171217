(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function Vue(options) {  // 暴露给外部的方法
    console.log(options);
    // 将options挂载在Vue上变成私有属性
    this.$options = options;
  }

  return Vue;

})));
//# sourceMappingURL=vue.js.map
