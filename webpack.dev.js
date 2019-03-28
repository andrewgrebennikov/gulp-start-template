const config = {
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
    entry: {
        index: './app/js/index.js'
    },
    output: {
        filename: '[name].min.js'
    }
};

module.exports = config;
