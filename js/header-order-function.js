/** 
 * 模拟常用的数组方法
*/

function forEach (array, fn) {
  if (!Array.isArray(array)) { throw '数据类型错误'}
  for (let i = 0; i < array.length; i++) {
    fn(array[i], i, array)
  }
}

function filter (array, fn) {
  let result = []
  for (let i = 0; i < array.length; i++) {
    if (fn(array[i], i, array)) {
      result.push(array[i])
    }
  }
  return result
}

function map(array, fn) {
  let result = []
  for(let value of array) {
    result.push(fn(value))
  }
  return result
}

function every(array, fn) {
  let result = true
  for(let value of array) {
    result = fn(value)
    if (!result) {
      break
    }
  }
  return result
}

function some(array, fn) {
  let result = false
  for(let value of array) {
    result = fn(value)
    if (result) {
      break
    }
  }
  return result
}

function slice(arr, start, end) {
  for (let i = 0; i < arr.length; i++) {
    
  }
}


var arr = [1,2,3,56,78,96,54,3]
// forEach(arr, function (item, index, source) {
//   console.log(`当前元素是${item}，索引是${index},源数组是${source}`)
// })

// const result = filter(arr, function (item, index, source) {
//   console.log(`当前元素是${item}，索引是${index},源数组是${source}`)
//   return item % 2 === 0
// })
// console.log(result)

// const a = map(arr, v => v - 4)
// console.log(a)


// console.log(every(arr, v => v > 10))
// console.log(some(arr, v => v > 10))