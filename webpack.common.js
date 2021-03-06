const path = require('path');
const fs = require('fs');
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');

// App directory
const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
    entry: path.resolve(appDirectory, "src/controllers"),
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'public/dist')
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
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new Dotenv({
            safe: true, // load '.env.example' to verify the '.env' variables are all set. Can also be a string to a different file.
            systemvars: true, // load all the predefined 'process.env' variables which will trump anything local per dotenv specs.,
            defaults: true // load '.env.defaults' as the default values if empty.
        })
    ],
}