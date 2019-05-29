module.exports = {
    plugins: [
        require('autoprefixer')(),
        require('postcss-flexbugs-fixes')(),
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
