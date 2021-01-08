function Vue(options) {  // 暴露给外部的方法
  console.log(options)
  // 将options挂载在Vue上变成私有属性
  this.$options = options
}

export default Vue
