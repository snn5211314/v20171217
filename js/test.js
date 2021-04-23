const lodash = require('./lib/lodash')

function getSum(a, b, c) {
  return a + b + c
}
// console.log('getSum', getSum.length)

function curry(func) {
  return function curriedFn(...args) {
    console.log('func', func, func.length, args.length)
    if (args.length < func.length) {
      return function () {
        // 参数合并使之最终就是调用外边的func
        return curriedFn(...args.concat(Array.from(arguments)))
      }
    }
    return func(...args)
  }
}

// let a = lodash.curry(getSum)
let a = curry(getSum)

console.log(a(1, 2, 3))
console.log('------------------------')
console.log(a(1)(2, 3))
console.log('------------------------')
console.log(a(1, 2)(3))



function mimoize(fn) {
  let cache = {}
  return function () {
    let key = JSON.stringify(arguments)
    cache[key] = cache[key] || fn.apply(this, arguments)
    return cache[key]
  }
}


function getArea(r) {
  console.log(r)
  return Math.PI * r * r
}

let fnArea = mimoize(getArea)

// console.log(fnArea(4))
// console.log(fnArea(4))
// console.log(fnArea(4))
// console.log(fnArea(4))



function compose(...args) {
  return function (value) {
    return args.reverse().reduce(function (acc, fn) {
      return fn(acc)
    }, value)
  }
}

const compose = (...args) => value => args.reverse().reduce((acc, fn) => fn(acc), value)

const reverse = arr => arr.reverse()
const first = arr => arr[0]
const toUpper = s => s.toUpperCase()

const f = compose(toUpper, first, reverse)

console.log(f(['one', 'two', 'three']))