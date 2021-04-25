import h from './mysnabbdom/h'
import patch from './mysnabbdom/patch'


// 获取盒子和按钮
const btn = document.getElementById('btn')
const container = document.getElementById('container')


var myVnode = h('ul', {}, [
  h('li', {key: 'A'}, 'A'),
  h('li', {key: 'B'}, 'B'),
  h('li', {key: 'C'}, 'C'),
  h('li', {key: 'D'}, 'D'),
  h('li', {key: 'E'}, 'E')
])

// var myVnode1 = h('section', {}, [
//   h('li', {}, '嘻嘻'),
//   h('li', {}, '哈哈'),
//   h('li', {}, [
//     h('div', {}, [
//       h('ol', {}, [
//         h('li', {}, '啊手动阀'),
//         h('li', {}, '阿斯顿'),
//         h('li', {}, '埃里克'),
//         h('li', {}, '卢卡斯')
//       ])
//     ])
//   ]),
//   h('li', {}, '你好'),
//   h('li', {}, '我不好'),
//   h('li', {}, '心情')
// ])

var myVnode1 = h('ul', {}, [
  h('li', {key: 'A'}, 'A'),
  h('li', {key: 'D'}, 'D'),
  h('li', {key: 'E'}, 'E')
])


patch(container, myVnode)

btn.onclick = function () {
  patch(myVnode, myVnode1)
}