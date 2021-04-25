export function isVnode(vnode) {
  return vnode.sel == undefined || vnode.sel == ''
}

export function isArray(arr) {
  return Array.isArray(arr)
}

export function sameNode(oldVnode, newVnode) {
  return oldVnode.key === newVnode.key && oldVnode.sel === newVnode.sel
}

export function isUndef(s) {
  return s === undefined;
}

export function isDef(s) {
  return s !== undefined;
}