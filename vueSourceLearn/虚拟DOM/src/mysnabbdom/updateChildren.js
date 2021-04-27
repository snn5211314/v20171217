import { isUndef, sameNode } from './util'
import patchVnode from './patchVnode'
import createElement from './createElement'

function createKeyToOldIdx(oldCh, start, end) {
  const map = {}
  for (let i = start; i <= end; i++) {
    const key = oldCh[i].key
    if (key !== undefined) {
      map[key] = i
    }
  }
  return map
}

export default function updateChildren(parentNode, oldCh, newCh) {
  // 定义4个指针和4个指针指向的元素
  let oldStartIdx = 0 // 旧前
  let newStartIdx = 0 // 新前
  let oldEndIdx = oldCh.length - 1 // 旧后
  let newEndIdx = newCh.length - 1 // 新后

  let oldStartVnode = oldCh[oldStartIdx]
  let oldEndVnode = oldCh[oldEndIdx]
  let newStartVnode = newCh[newStartIdx]
  let newEndVnode = newCh[newEndIdx]

  let oldKeyToIdx; // 定义old节点对应的Map
  let elmToMove; // 确定要移动的节点
  let idxInOld; // 定义要移动节点的索引

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVnode == null) {
      oldStartVnode = oldCh[++oldStartIdx];
    } else if (oldEndVnode == null) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (newStartVnode == null) {
      newStartVnode = newCh[++newStartIdx];
    } else if (newEndVnode == null) {
      newEndVnode = newCh[--newEndIdx];
    } else if (sameNode(oldStartVnode, newStartVnode)) { // 第一种 旧前和新前
      console.log('第一种请款')
      patchVnode(oldStartVnode, newStartVnode)
      // 指针下移 并 更新指定的节点
      oldStartIdx++
      newStartIdx++
      oldStartVnode = oldCh[oldStartIdx]
      newStartVnode = newCh[newStartIdx]
    } else if (sameNode(oldEndVnode, newEndVnode)) { // 第二种 旧后和新后
      console.log('第二种请款')
      patchVnode(oldEndVnode, newEndVnode)
      // 指针上移 并 更新指定的节点
      oldEndIdx--
      newEndIdx--
      oldEndVnode = oldCh[oldEndIdx]
      newEndVnode = newCh[newEndIdx]
    } else if (sameNode(oldStartVnode, newEndVnode)) { // 第三种，旧前和新后
      console.log('第三种情况')
      patchVnode(oldStartVnode, newEndVnode)
      // 将旧前节点移动到旧后之后
      parentNode.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling)
      oldStartIdx++
      newEndIdx--
      oldStartVnode = oldCh[oldStartIdx]
      newEndVnode = newCh[newEndIdx]

    } else if (sameNode(oldEndVnode, newStartVnode)) { // 第四种，旧后和新前
      console.log('第四种请款')
      patchVnode(oldEndVnode, newStartVnode)
      // 将旧后节点移动到旧前之前
      parentNode.insertBefore(oldEndVnode.elm, oldStartVnode.elm)
      oldEndIdx--
      newStartIdx--
      oldEndVnode = oldCh[oldEndIdx]
      newStartVnode = newCh[newStartIdx]
    } else { // 前四种方式没有命中
      if (oldKeyToIdx === undefined) { // 第一次
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
      }
      idxInOld = oldKeyToIdx[newStartVnode.key]
      if (isUndef(idxInOld)) {
        // 说明是全新节点需要创建并上树
        parentNode.insertBefore(createElement(newStartVnode), oldStartVnode.elm)
      } else { // 说明在老节点中能找到相同key的节点
        // 获取老节点中的元素
        elmToMove = oldCh[idxInOld]
        if (elmToMove.sel !== newStartVnode.sel) { // 说明key相同，但是元素的选择器不同
          parentNode.insertBefore(createElement(newStartVnode), oldStartVnode.elm)
        } else {
          parentNode(elmToMove, newStartVnode)
          // 将老节点中处理的节点坐上标记
          oldCh[idxInOld] = undefined
          // 要将移动的节点插入到老的开始节点之前
          parentNode.insertBefore(elmToMove.elm, oldStartVnode.elm)
        }
      }

      // 只更新新节点中指针，因为是以新节点为基准在老节点中查找
      newStartIdx++
      newStartVnode = newCh[newStartIdx]
    }
  }

  if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
    if (newStartIdx <= newEndIdx) {
      let before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm
      for (let i = newStartIdx; i <= newEndIdx; i++) {
        if (before === undefined) { before = null }
        parentNode.insertBefore(createElement(newCh[i]), before)
      }
    } else {
      for (let i = oldStartIdx; i <= oldEndIdx; i++) {
        parentNode.removeChild(oldCh[i].elm)
      }
    }
  }
}