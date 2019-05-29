const config = {
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    entry: {
        index: './app/js/index.js',
        about: './app/js/about.js'
    },
    output: {
        filename: '[name].min.js'
    }
};

module.exports = config;
