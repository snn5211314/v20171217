import vnode from "./vnode";
import { isVnode, isDef } from './util';
import createElement from './createElement';

export default function patch(oldVnode, newVnode) {
  // 判断老节点是DOM还是虚拟节点,是dom就包装成虚拟节点
  if (isVnode(oldVnode)) {
    oldVnode = vnode(oldVnode.tagName.toLowerCase(), {}, [], undefined, oldVnode)
  }

  // 判断 oldCnode 和 newVnode 是不是相同节点
  if (oldVnode.sel === newVnode.sel && oldVnode.key === newVnode.key) {
    // 是同一个节点，精细化比较
    // 判断是不是同一个虚拟节点
    if (oldVnode === newVnode) return
    // 判断新节点有没有文本属性
    if (isDef(newVnode.text)) {
      
    }
  } else {
    // 不是相同节点，那就暴力删除
    let relDmo = createElement(newVnode)
    // 上树
    oldVnode.elm.parentNode.insertBefore(relDmo, oldVnode.elm)

    // 删除老节点
    oldVnode.elm.parentNode.removeChild(oldVnode.elm)
  }
}