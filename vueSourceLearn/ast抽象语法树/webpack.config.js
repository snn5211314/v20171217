const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    // 虚拟路径
    publicPath: 'xuni',
    filename: 'bundle.js'
  },
  devServer: {
    port: 8080,
    contentBase: 'www'
  }
}