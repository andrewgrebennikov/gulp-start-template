const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const config = {
    mode: 'production',
    entry: {
        index: './app/js/index.js'
    },
    output: {
        filename: '[name].min.js'
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    },
    plugins: [
        new UglifyJSPlugin({
            cache: true,
            parallel: true,
            sourceMap: true
        })
    ]
};

module.exports = config;