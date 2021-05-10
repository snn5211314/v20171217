import { observe } from "./observer";
import { isFunction } from "./utils";

export function initState(vm) {
  const opt = vm.$options; // 获取options
  if (opt.data) {
    initData(vm)
  }
}

function proxy(obj, key, sourceKey) {
  Object.defineProperty(obj, key, {
    get() {
      return obj[sourceKey][key]
    },
    set(newValue) {
      obj[sourceKey][key] = newValue
    }
  })
}

function initData(vm) {
  let data = vm.$options.data // data有可能是一个函数，也有可能是一个对象

  // 获取data数据，并挂载到vm的_data属性上，后续对data观测，将data重新改写成响应式数据时候，vm._data也会变成响应式，因为都指向相同的内存索引
  data = vm._data = isFunction(data) ? data.call(vm) : data

  // 用户使用vm._data.xxx访问有点不方便，所以想直接通过vm.xxx来获取或者设置
  const keys = Object.keys(data)
  for (let i = 0; i < keys.length; i++) {
    proxy(vm, keys[i], '_data')
  }

  // 对数据进行劫持
  observe(data)
}