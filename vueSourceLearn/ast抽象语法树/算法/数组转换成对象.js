/**
 * 将 [1, 2, [3, [4, 5], 6], 7, [8], 9]
 * 转换成
 * {
  children: [
    { value: 1 },
    { value: 2 },
    {
      children: [
        { value: 3 },
        {
          children: [
            { value: 4 },
            { value: 5 }
          ]
        },
        { value: 6 }
      ]
    },
    { value: 7 },
    {
      children: [
        { value: 8 }
      ]
    },
    { value: 9 }
  ]
}
 */


function transStyle(arr) {
  var result = {
    children: []
  }
  for (let i = 0; i < arr.length; i++) {
    let temp;
    if (Array.isArray(arr[i])) {
      temp = transStyle(arr[i])
    } else {
      temp = { value: arr[i] }
    }
    result.children.push(temp)
  }
  return result
}

function convert(item) {
  if (typeof item === 'number') {
    return {
      value: item
    }
  } else if (Array.isArray(item)) {
    return {
      children: item.map(_item => convert(_item))
    }
  }
}



let res = transStyle([1, 2, [3, [4, 5], 6], 7, [8], 9])
let res1 = convert([1, 2, [3, [4, 5], 6], 7, [8], 9])
console.log(res)
console.log(res1)