import { isArray } from './util';

export default function createElement(vnode) {
  // 目的是将虚拟dom转换成真实的dom
  let domNode = document.createElement(vnode.sel)
  if (vnode.text !== undefined && (vnode.children === undefined || vnode.children.length === 0)) {
    // 说明是个文本节点
    domNode.innerText = vnode.text
  } else if (isArray(vnode.children) && vnode.children.length > 0) {
    // 说明是有children节点
    for (let i = 0; i < vnode.children.length; i++) {
      let ch = vnode.children[i]
      // 递归生成dom，组装树型关系
      let chDom = createElement(ch)
      // 上树
      domNode.appendChild(chDom)
    }
  }
  // 修改vnode中elm的指向
  vnode.elm = domNode

  return domNode
}