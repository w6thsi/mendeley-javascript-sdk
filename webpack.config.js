var webpack = require('webpack'),

    minify = process.argv[2] === '--minify',
    plugins = [new webpack.ProvidePlugin({
        Promise: 'bluebird'
    })];

if (minify) {
    plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = {
    entry: ['./bower_components/es5-shim/es5-shim.js', './lib/index.js'],
    output: {
        path: './dist',
        filename: 'standalone' + (minify ? '.min' : '') + '.js',

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
    devtool: minify ? "source-map" : "",
    plugins: plugins
};
