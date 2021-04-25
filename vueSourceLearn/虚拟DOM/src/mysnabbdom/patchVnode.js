import updateChildren from './updateChildren'
import { isUndef, isDef } from './util'
import createElement from './createElement'

export default function patchVnode(oldVnode, newVnode) {
  // 判断是不是同一个虚拟节点
  if (oldVnode === newVnode) return
  // 判断新节点有没有文本属性
  if (isUndef(newVnode.text)) {
    // 说明newVnode没有text属性,有children属性
    if (isDef(oldVnode.children)) { // 判断oldVnode有没有children属性
      // 该分支说明是最复杂的情况，新老节点都有children属性
      updateChildren(oldVnode.elm, oldVnode.children, newVnode.children)
    } else { // 说明oldVnode没有children属性，有text属性
      oldVnode.elm.innerText = ''
      for (let i = 0; i < newVnode.children.length; i++) {
        let ch = createElement(newVnode.children[i])
        oldVnode.elm.appendChild(ch)
      }
    }
  } else {
    // 说明newVnode有text属性
    if (isDef(oldVnode.text) && oldVnode.text !== newVnode.text) {
      oldVnode.elm.innerText = newVnode.text
    }
  }
}