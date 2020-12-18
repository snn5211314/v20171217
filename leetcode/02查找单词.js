var exist = function(board, word) {
  if (board.length === 0) return false
  if (word.length === 0) return false

  // 定义二维数组的行和列
  const row = board.length
  const column = board[0].length

  for(let i = 0; i < row; i++) {
      for(let j = 0; j < column; j++) {
          const result = promotFunc(i, j, 0)
          if (result) return true
      }
  }
  return false


  function promotFunc(i, j, cur) {
      // 判断边界
      if (i >= row || i < 0) return false
      if (j >= column || j < 0) return false

      let temp = board[i][j]
      if (temp !== word[cur]) return false
      if (cur === word.length - 1) return true

      board[i][j] = null
      
      const result = promotFunc(i + 1, j, cur + 1) ||
                     promotFunc(i - 1, j, cur + 1) ||
                     promotFunc(i, j - 1, cur + 1) ||
                     promotFunc(i, j + 1, cur + 1) 

      board[i][j] = temp
      return result
  }
};

const result = exist([["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]],"ABCCED")
console.log(result)