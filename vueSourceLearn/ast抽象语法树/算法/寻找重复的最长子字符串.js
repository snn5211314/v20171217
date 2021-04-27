function searchMaxSame(s) {
  let i = 0;
  let j = 1;
  let temp = 0;

  while (i < s.length - 1) {
    if (s[i] !== s[j]) {
      // console.log(s[i] + '元素从' + i + '到' + j + '之间，重复了' + (j - i) + '次')
      temp = Math.max(temp, j - i)
      i = j
    }
    j++
  }
  return temp
}

var str = 'aaaaaaaaaaaabvvvvvvvvvvvvvvvvssssssssssssssssswwwwwwwwwwwwererererererererererererertttttttttt'
console.log(searchMaxSame(str))