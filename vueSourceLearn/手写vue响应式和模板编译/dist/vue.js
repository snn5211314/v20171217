(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function parse(template) {
  }

  function mount(el) {
    el = el && query(el);
    let template = getOuterHTML(el);
    compileToFunctions(template);
  }

  function query(el) {
    // el要不是选择器，要不是dom
    if (typeof el === 'string') {
      const selected = document.querySelector(el);
      return selected;
    } else {
      return el;
    }
  }

  function getOuterHTML(el) {
    return el.outerHTML;
  }

  function compileToFunctions(template) {
    createCompiler(template);
  }

  const createCompiler = function (template) {
    const ast = parse(template.trim());
    const code = generate(ast, options);
    return {
      ast,
      render: code.render
    };
  };

  function isObject(val) {
    return typeof val === 'object' && val !== null;
  }
  function isArray(val) {
    return Array.isArray(val);
  }
  function isFunction(val) {
    return typeof val === 'function';
  }
  function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    });
  }

  // 获取数组原型方法
  const arrayProto = Array.prototype;
  const arrayMethods = Object.create(arrayProto); // 

  const methodsToPatch = [// 数组中7个变异方法
  'pop', 'push', 'shift', 'unshift', 'reverse', 'splice', 'sort'];
  methodsToPatch.forEach(function (method) {
    // 获取数组原型上的方法
    const original = arrayProto[method];

    arrayMethods[method] = function (...args) {
      // 对于数组上的7个变异方法重写，其实还是调用数组原来的方法，不过对于这几个方法可以对新增数据进行观测劫持
      const result = original.call(this, ...args); // 调用数组的原有方法

      const ob = this.__ob__;
      let inserted;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2);
          break;
      }

      if (inserted) ob.observeArray(inserted); // 对数组有新增参数方法，进行劫持

      return result;
    };
  });

  class Observe {
    // 观测类，返回响应式数据
    constructor(value) {
      def(value, '__ob__', this);

      if (isArray(value)) {
        value.__proto__ = arrayMethods; // 之影响vue内部数组的方法

        this.observeArray(value);
      } else {
        this.walk(value);
      }
    }

    observeArray(value) {
      for (let i = 0; i < value.length; i++) {
        observe(value[i]);
      }
    }

    walk(obj) {
      Object.keys(obj).forEach(key => {
        defineReactive(obj, key, obj[key]);
      });
    }

  }

  function defineReactive(obj, key, value) {
    // vue性能差的原因之一
    observe(value); // 递归调用进行数据劫持

    Object.defineProperty(obj, key, {
      get() {
        return value;
      },

      set(newValue) {
        observe(newValue); // 对设置的值也要进行观测

        if (newValue !== value) {
          value = newValue;
        }
      }

    });
  }

  function observe(value) {
    // 只对对象进行观测
    if (!isObject(value)) {
      return;
    }

    return new Observe(value);
  }

  function initState(vm) {
    const opt = vm.$options; // 获取options

    if (opt.data) {
      initData(vm);
    }
  }

  function proxy(obj, key, sourceKey) {
    Object.defineProperty(obj, key, {
      get() {
        return obj[sourceKey][key];
      },

      set(newValue) {
        obj[sourceKey][key] = newValue;
      }

    });
  }

  function initData(vm) {
    let data = vm.$options.data; // data有可能是一个函数，也有可能是一个对象
    // 获取data数据，并挂载到vm的_data属性上，后续对data观测，将data重新改写成响应式数据时候，vm._data也会变成响应式，因为都指向相同的内存索引

    data = vm._data = isFunction(data) ? data.call(vm) : data; // 用户使用vm._data.xxx访问有点不方便，所以想直接通过vm.xxx来获取或者设置

    const keys = Object.keys(data);

    for (let i = 0; i < keys.length; i++) {
      proxy(vm, keys[i], '_data');
    } // 对数据进行劫持


    observe(data);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      const vm = this;
      vm.$options = options; // vue的初始化

      if (options.data) {
        // 进行数据处理
        initState(vm);
      }

      if (options.el) {
        mount(options.el);
      }
    };
  }

  function Vue(options) {
    // Vue的构造函数
    this._init(options);
  }

  initMixin(Vue);

  return Vue;

})));
