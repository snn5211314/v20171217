import vnode from './vnode'

/**
 * 低配版的h函数，这个函数接受3个参数，缺一不可
 * @export
 * @param {*} s 选择器
 * @param {*} data 数据
 * @param {*} c 其他参数
 */
export default function (s, data, c) {
  if (arguments.length !== 3) {
    throw new Error('参数数量不对')
  }
  if (typeof c === 'string' || typeof c === 'number') {
    return vnode(s, data, undefined, c, undefined)
  } else if (Array.isArray(c)) {
    let children = []
    for (let i = 0; i < c.length; i++) {
      if (!(typeof c[i] === 'object' && c[i].hasOwnProperty('sel'))) {
        throw new Error('传入的数组中参数有项不是h函数')
      }
      children.push(c[i])
    }
    return vnode(s, data, children, undefined, undefined)
  } else if (typeof c === 'object' && c.hasOwnProperty('sel')) {
    // 说明是h函数
    let children = [c]
    return vnode(s, data, children, undefined, undefined)
  } else {
    throw new Error('传入第三个参数类型不对')
  }
}