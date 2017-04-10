var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');

module.exports = {
    entry: [
        './src/index.jsx'
    ],
    devtool: process.env.WEBPACK_DEVTOOL || 'source-map',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        loaders: loaders
    },
    devServer: {
        contentBase: "./dist",
            noInfo: true, //  --no-info option
            hot: true,
            inline: true
        },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin()
    ]
};
