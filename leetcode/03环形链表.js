var hasCycle = function(head) {
    let cache = new Set()
    while(head) {// head.next是获取下一个元素的
      if (cache.has(head)) {
        return true
      } else {
        cache.add(head)
      }
      head = head.next
    }
    return false
};