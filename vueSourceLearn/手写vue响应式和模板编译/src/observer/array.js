// 获取数组原型方法
const arrayProto = Array.prototype

export const arrayMethods = Object.create(arrayProto) // 

const methodsToPatch = [ // 数组中7个变异方法
  'pop',
  'push',
  'shift',
  'unshift',
  'reverse',
  'splice',
  'sort'
]

methodsToPatch.forEach(function (method) {
  // 获取数组原型上的方法
  const original = arrayProto[method]

  arrayMethods[method] = function (...args) { // 对于数组上的7个变异方法重写，其实还是调用数组原来的方法，不过对于这几个方法可以对新增数据进行观测劫持
    const result = original.call(this, ...args) // 调用数组的原有方法
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted) // 对数组有新增参数方法，进行劫持
    return result
  }
})
