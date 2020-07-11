const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// App directory
const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
    entry: path.resolve(appDirectory, "src"),
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, '../public/dist')
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                loader: 'source-map-loader',
                enforce: 'pre',
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            },
            {
                test: /\.(png|jpg|gif|gltf|glb|babylon|obj|stl)$/i,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                    },
                }, ],
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
}