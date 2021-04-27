function fib(n) {
  if (n === 0 || n === 1) {
    return 1
  }
  return fib(n - 1) + fib(n - 2)
}

// 上边实现会存在方法的多次调用

// 使用cache缓存已经计算过的方法值
let cache = {}
function fib(n) {
  if (cache[n]) {
    return cache[n]
  }

  var v = n === 0 || n === 1 ? 1 : fib(n - 1) + fib(n - 2)
  cache[n] = v
  return v
}

