const config = {
	mode: 'production',
	entry: {
        index: './app/js/index.js',
		about: './app/js/about.js'
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
    }
};

module.exports = config;
