var maxDepth = function(root) {
  if (root === null) return 0

  // 左边和有边的最大值 + 1
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right))
};