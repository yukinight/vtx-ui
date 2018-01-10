var webpack = require('webpack');
var CSSSplitWebpackPlugin = require('css-split-webpack-plugin/dist/index').default;

module.exports = function(webpackConfig, env) {
// adding plugins to your configuration
    webpackConfig.plugins.push( 
        new CSSSplitWebpackPlugin({
            size: 1000,
            imports:true
        })
    )
    return webpackConfig
}