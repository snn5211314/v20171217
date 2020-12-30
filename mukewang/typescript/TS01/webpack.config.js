const Path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
	entry: './src/main.js',
	output: {
		path: Path.resolve(__dirname, 'dist'),
		filename: 'main.js'
	},
	devServer: {
		contentBase: 'dist',
		open: true
	},
	resolve: {
		"extensions": ['.ts', '.js', '.json']
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.(eot|woff2|woff|ttf|svg)$/,
				use: ['file-loader']
			},
			{
				test: /\.ts$/,
				use: ['ts-loader'],
				excu
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html'
		}),
		new CleanWebpackPlugin()
	],
	mode: 'development'
}