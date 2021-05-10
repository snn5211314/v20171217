import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: './src/index.js',
  output: {
    file: './dist/vue.js',
    format: 'umd',
    name: 'Vue'
  },
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
}