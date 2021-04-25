import vnode from "./vnode";
import { isVnode, sameNode } from './util';
import createElement from './createElement';
import patchVnode from "./patchVnode";

export default function patch(oldVnode, newVnode) {
  // 判断老节点是DOM还是虚拟节点,是dom就包装成虚拟节点
  if (isVnode(oldVnode)) {
    oldVnode = vnode(oldVnode.tagName.toLowerCase(), {}, [], undefined, oldVnode)
  }

  // 判断 oldCnode 和 newVnode 是不是相同节点
  if (sameNode(oldVnode, newVnode)) {
    patchVnode(oldVnode, newVnode)
  } else {
    // 不是相同节点，那就暴力删除
    let relDmo = createElement(newVnode)
    // 上树
    oldVnode.elm.parentNode.insertBefore(relDmo, oldVnode.elm)

    // 删除老节点
    oldVnode.elm.parentNode.removeChild(oldVnode.elm)
  }
}