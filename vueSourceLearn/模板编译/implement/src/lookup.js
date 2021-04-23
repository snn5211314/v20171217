// 识别a.b.c
export default function lookup(data, keyName) {
  if (keyName.indexOf('.') !== -1 && keyName !== '.') {
    let names = keyName.split('.')
    let temp = data
    let index = 0
    while (index < names.length) {
      temp = temp[names[index]]
      index++
    }
    return temp
  }
  return data[keyName]
}
