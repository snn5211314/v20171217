
/**
 * 将传进来的数据组装成一个对象
 * @export
 * @param {*} sel 选择器
 * @param {*} data 数据
 * @param {*} children 子节点
 * @param {*} text 文本属性
 * @param {*} elm 真实dom
 * @returns { sel, data, children, text, elm, key }
 */
export function vnode(sel, data, children, text, elm) {
    const key = data === undefined ? undefined : data.key;
    return { sel, data, children, text, elm, key };
}
