module.exports = {
    plugins: [
        require('autoprefixer')(),
        require('postcss-flexbugs-fixes')(),
		require('postcss-import')(),
        require('cssnano')({
            preset: [
                'default', {
                    discardComments: {
                        removeAll: true
                    }
                }
            ]
        })
    ]
};
