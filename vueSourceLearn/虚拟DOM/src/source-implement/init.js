import { vnode } from "./vnode";
import * as is from "./is";
import { htmlDomApi } from "./htmldomapi";
function isUndef(s) { // 判断是undefined
    return s === undefined;
}
function isDef(s) { // 判断不是undefined
    return s !== undefined;
}
// 生成一个空节点
const emptyNode = vnode("", {}, [], undefined, undefined);

// 判断两个节点是不是相同节点
function sameVnode(vnode1, vnode2) {
    // 条件是相同的key 和 sel
    var _a, _b;
    const isSameKey = vnode1.key === vnode2.key;
    const isSameIs = ((_a = vnode1.data) === null || _a === void 0 ? void 0 : _a.is) === ((_b = vnode2.data) === null || _b === void 0 ? void 0 : _b.is);
    const isSameSel = vnode1.sel === vnode2.sel;
    return isSameSel && isSameKey && isSameIs;
}

// 判断是不是虚拟节点
function isVnode(vnode) {
    return vnode.sel !== undefined;
}

// 创建缓存，提高diff效率
function createKeyToOldIdx(children, beginIdx, endIdx) {
    var _a;
    const map = {};
    for (let i = beginIdx; i <= endIdx; ++i) {
        const key = (_a = children[i]) === null || _a === void 0 ? void 0 : _a.key;
        if (key !== undefined) {
            map[key] = i;
        }
    }
    return map;
}
const hooks = [
    "create",
    "update",
    "remove",
    "destroy",
    "pre",
    "post",
];
export function init(modules, domApi) {
    let i;
    let j;
    const cbs = {
        create: [],
        update: [],
        remove: [],
        destroy: [],
        pre: [],
        post: [],
    };
    // 定义api是外部传递进来还是用内部定义的操作domApi
    const api = domApi !== undefined ? domApi : htmlDomApi;

    for (i = 0; i < hooks.length; ++i) {
        cbs[hooks[i]] = [];
        for (j = 0; j < modules.length; ++j) {
            const hook = modules[j][hooks[i]];
            if (hook !== undefined) {
                cbs[hooks[i]].push(hook);
            }
        }
    }

    function emptyNodeAt(elm) {
        const id = elm.id ? "#" + elm.id : "";
        const c = elm.className ? "." + elm.className.split(" ").join(".") : "";
        return vnode(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
    }

    function createRmCb(childElm, listeners) {
        return function rmCb() {
            if (--listeners === 0) {
                const parent = api.parentNode(childElm);
                api.removeChild(parent, childElm);
            }
        };
    }

    function createElm(vnode, insertedVnodeQueue) {
        var _a, _b;
        let i;
        let data = vnode.data;
        if (data !== undefined) {
            const init = (_a = data.hook) === null || _a === void 0 ? void 0 : _a.init;
            if (isDef(init)) {
                init(vnode);
                data = vnode.data;
            }
        }
        const children = vnode.children;
        const sel = vnode.sel;
        if (sel === "!") {
            if (isUndef(vnode.text)) {
                vnode.text = "";
            }
            vnode.elm = api.createComment(vnode.text);
        }
        else if (sel !== undefined) {
            // Parse selector
            const hashIdx = sel.indexOf("#");
            const dotIdx = sel.indexOf(".", hashIdx);
            const hash = hashIdx > 0 ? hashIdx : sel.length;
            const dot = dotIdx > 0 ? dotIdx : sel.length;
            const tag = hashIdx !== -1 || dotIdx !== -1
                ? sel.slice(0, Math.min(hash, dot))
                : sel;
            const elm = (vnode.elm =
                isDef(data) && isDef((i = data.ns))
                    ? api.createElementNS(i, tag, data)
                    : api.createElement(tag, data));
            if (hash < dot)
                elm.setAttribute("id", sel.slice(hash + 1, dot));
            if (dotIdx > 0)
                elm.setAttribute("class", sel.slice(dot + 1).replace(/\./g, " "));
            for (i = 0; i < cbs.create.length; ++i)
                cbs.create[i](emptyNode, vnode);
            if (is.array(children)) {
                for (i = 0; i < children.length; ++i) {
                    const ch = children[i];
                    if (ch != null) {
                        api.appendChild(elm, createElm(ch, insertedVnodeQueue));
                    }
                }
            }
            else if (is.primitive(vnode.text)) {
                api.appendChild(elm, api.createTextNode(vnode.text));
            }
            const hook = vnode.data.hook;
            if (isDef(hook)) {
                (_b = hook.create) === null || _b === void 0 ? void 0 : _b.call(hook, emptyNode, vnode);
                if (hook.insert) {
                    insertedVnodeQueue.push(vnode);
                }
            }
        }
        else {
            vnode.elm = api.createTextNode(vnode.text);
        }
        return vnode.elm;
    }

    function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
        for (; startIdx <= endIdx; ++startIdx) {
            const ch = vnodes[startIdx];
            if (ch != null) {
                api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
            }
        }
    }

    function invokeDestroyHook(vnode) {
        var _a, _b;
        const data = vnode.data;
        if (data !== undefined) {
            (_b = (_a = data === null || data === void 0 ? void 0 : data.hook) === null || _a === void 0 ? void 0 : _a.destroy) === null || _b === void 0 ? void 0 : _b.call(_a, vnode);
            for (let i = 0; i < cbs.destroy.length; ++i)
                cbs.destroy[i](vnode);
            if (vnode.children !== undefined) {
                for (let j = 0; j < vnode.children.length; ++j) {
                    const child = vnode.children[j];
                    if (child != null && typeof child !== "string") {
                        invokeDestroyHook(child);
                    }
                }
            }
        }
    }

    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
        var _a, _b;
        for (; startIdx <= endIdx; ++startIdx) {
            let listeners;
            let rm;
            const ch = vnodes[startIdx];
            if (ch != null) {
                if (isDef(ch.sel)) {
                    invokeDestroyHook(ch);
                    listeners = cbs.remove.length + 1;
                    rm = createRmCb(ch.elm, listeners);
                    for (let i = 0; i < cbs.remove.length; ++i)
                        cbs.remove[i](ch, rm);
                    const removeHook = (_b = (_a = ch === null || ch === void 0 ? void 0 : ch.data) === null || _a === void 0 ? void 0 : _a.hook) === null || _b === void 0 ? void 0 : _b.remove;
                    if (isDef(removeHook)) {
                        removeHook(ch, rm);
                    }
                    else {
                        rm();
                    }
                }
                else {
                    // Text node
                    api.removeChild(parentElm, ch.elm);
                }
            }
        }
    }

    // diff的核心算法
    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
        // 定义4个指针和指针
        let oldStartIdx = 0;
        let newStartIdx = 0;
        let oldEndIdx = oldCh.length - 1;
        let oldStartVnode = oldCh[0];
        let oldEndVnode = oldCh[oldEndIdx];
        let newEndIdx = newCh.length - 1;
        let newStartVnode = newCh[0];
        let newEndVnode = newCh[newEndIdx];

        let oldKeyToIdx;
        let idxInOld;
        let elmToMove;
        let before;
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            // 判断之前节点有没有被标记过，标记过就移动指针，一直到没有标记的节点
            if (oldStartVnode == null) {
                oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
            }
            else if (oldEndVnode == null) {
                oldEndVnode = oldCh[--oldEndIdx];
            }
            else if (newStartVnode == null) {
                newStartVnode = newCh[++newStartIdx];
            }
            else if (newEndVnode == null) {
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldStartVnode, newStartVnode)) { // 判断旧前和新前节点
                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                // 更新指针和指针对应的节点
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else if (sameVnode(oldEndVnode, newEndVnode)) { // 判断旧后和新后节点
                patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldStartVnode, newEndVnode)) { // 判断旧前和新后节点
                // Vnode moved right
                patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                // 将旧前节点移动到旧后之后
                api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
                // 更新指针和指针对应的节点
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldEndVnode, newStartVnode)) { // 判断旧后和新前节点
                // Vnode moved left
                patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                // 将旧后节点移动到旧前之前
                api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                // 更新指针和指针对应的节点
                oldEndVnode = oldCh[--oldEndIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else { // 前四种情况都没有
                if (oldKeyToIdx === undefined) {
                    oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                }
                idxInOld = oldKeyToIdx[newStartVnode.key];
                if (isUndef(idxInOld)) {
                    // New element
                    api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                }
                else {
                    elmToMove = oldCh[idxInOld];
                    if (elmToMove.sel !== newStartVnode.sel) {
                        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    }
                    else {
                        patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                        oldCh[idxInOld] = undefined;
                        api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                    }
                }
                newStartVnode = newCh[++newStartIdx];
            }
        }
        if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) { // 遍历完成后，判断是不是还存在没有处理完成的节点
            if (oldStartIdx > oldEndIdx) { // 说明还存在新节点
                // 判断需要插入的标杆元素
                before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
                // 将剩余的新节点上树
                addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
            }
            else { // 说明还存在没有比较的老节点，直接删除
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
            }
        }
    }
    function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
        var _a, _b, _c, _d, _e;
        const hook = (_a = vnode.data) === null || _a === void 0 ? void 0 : _a.hook;
        (_b = hook === null || hook === void 0 ? void 0 : hook.prepatch) === null || _b === void 0 ? void 0 : _b.call(hook, oldVnode, vnode);
        const elm = (vnode.elm = oldVnode.elm);
        const oldCh = oldVnode.children;
        const ch = vnode.children;
        if (oldVnode === vnode)
            return;
        if (vnode.data !== undefined) {
            for (let i = 0; i < cbs.update.length; ++i)
                cbs.update[i](oldVnode, vnode);
            (_d = (_c = vnode.data.hook) === null || _c === void 0 ? void 0 : _c.update) === null || _d === void 0 ? void 0 : _d.call(_c, oldVnode, vnode);
        }
        if (isUndef(vnode.text)) { // 新节点没有text属性
            if (isDef(oldCh) && isDef(ch)) { // 新老节点都有children属性
                if (oldCh !== ch)
                    updateChildren(elm, oldCh, ch, insertedVnodeQueue);
            }
            else if (isDef(ch)) { // 新节点有children属性
                if (isDef(oldVnode.text)) // 老节点的text属性存在，就先清空
                    api.setTextContent(elm, "");
                addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue); // 将新节点的children上树
            }
            else if (isDef(oldCh)) { // 老节点有children属性
                removeVnodes(elm, oldCh, 0, oldCh.length - 1); // 移除老节点的children元素
            }
            else if (isDef(oldVnode.text)) { // 老节点有没有text属性
                api.setTextContent(elm, ""); // 清空老节点的text
            }
        }
        else if (oldVnode.text !== vnode.text) { // 新老节点的text属性是否相等
            if (isDef(oldCh)) { // 老节点是不是有children属性
                removeVnodes(elm, oldCh, 0, oldCh.length - 1); // 移除老节点的孩子节点
            }
            api.setTextContent(elm, vnode.text); // 将新节点的text属性更新上去
        }
        (_e = hook === null || hook === void 0 ? void 0 : hook.postpatch) === null || _e === void 0 ? void 0 : _e.call(hook, oldVnode, vnode);
    }
    return function patch(oldVnode, vnode) {
        let i, elm, parent;
        // 定义要插入虚拟节点的队列
        const insertedVnodeQueue = [];

        for (i = 0; i < cbs.pre.length; ++i)
            cbs.pre[i]();
        if (!isVnode(oldVnode)) {
            oldVnode = emptyNodeAt(oldVnode);
        }

        // 判断老的虚拟节点和新的虚拟节点是不是相同节点
        if (sameVnode(oldVnode, vnode)) { // 是，就patchVnode
            patchVnode(oldVnode, vnode, insertedVnodeQueue);
        }
        else { // 不是，说明需要清除老的节点生成新的节点并上树
            elm = oldVnode.elm;
            parent = api.parentNode(elm);
            // 将新的节点变成真实的dom
            createElm(vnode, insertedVnodeQueue);
            if (parent !== null) {
                // 插入新的dom
                api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
                // 移除老的dom
                removeVnodes(parent, [oldVnode], 0, 0);
            }
        }
        for (i = 0; i < insertedVnodeQueue.length; ++i) {
            insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
        }
        for (i = 0; i < cbs.post.length; ++i)
            cbs.post[i]();
        return vnode;
    };
}