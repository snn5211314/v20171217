import { isArray, isObject, def } from "../utils";
import { arrayMethods } from "./array";

class Observe { // 观测类，返回响应式数据
  constructor(value) {
    def(value, '__ob__', this)
    if (isArray(value)) {
      value.__proto__ = arrayMethods // 之影响vue内部数组的方法
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  observeArray(value) {
    for(let i = 0; i < value.length; i++) {
      observe(value[i])
    }
  }

  walk(obj) {
    Object.keys(obj).forEach(key => {
      defineReactive(obj, key, obj[key])
    })
  }
}

function defineReactive(obj, key, value) { // vue性能差的原因之一
  observe(value) // 递归调用进行数据劫持
  Object.defineProperty(obj, key, {
    get() {
      return value
    },
    set(newValue) {
      observe(newValue) // 对设置的值也要进行观测
      if (newValue !== value) {
        value = newValue
      }
    }
  })
}

export function observe(value) {
  // 只对对象进行观测
  if (!isObject(value)) {
    return
  }
  return new Observe(value)
}