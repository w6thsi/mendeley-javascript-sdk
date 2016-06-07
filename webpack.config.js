var webpack = require('webpack');
var plugins = [new webpack.ProvidePlugin({
    Promise: 'bluebird'
})];
var useMinifier = (process.argv.slice(1).indexOf('--minify') !== -1);

if (useMinifier) {
    plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = {
    entry: {
        main: './lib/index.js'
    },
    output: {
        path: './dist',
        filename: 'standalone' + (useMinifier ? '.min' : '') + '.js',
        library: 'MendeleySDK',
        libraryTarget: 'umd'
    },
    resolve: {
        modulesDirectories: [
            'node_modules',
            'bower_components',
            'lib',
            'test'
        ]
    },
    devtool: useMinifier ? 'source-map' : '',
    plugins: plugins
};
