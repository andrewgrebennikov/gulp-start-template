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
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
					enforce: true
                }
            }
        }
    }
};

module.exports = config;
