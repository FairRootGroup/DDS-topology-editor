var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');

module.exports = {
    entry: [
        './src/index.jsx'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: loaders
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({ minimize: true }),
        new webpack.optimize.OccurrenceOrderPlugin()
    ]
};
