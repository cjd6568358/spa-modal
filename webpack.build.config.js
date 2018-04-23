const cssnano = require('cssnano')
const pxtorem = require('postcss-pxtorem')
module.exports = {
    module: {
        rules: [{
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    extractCSS: false,
                    preserveWhitespace: false,
                    transformToRequire: {
                        video: 'src',
                        source: 'src',
                        img: 'src',
                        image: 'xlink:href'
                    },
                    postcss: [
                        require('autoprefixer')({
                            browsers: ['iOS >= 7', 'Android >= 4.0']
                        }),
                        // pxtorem({
                        //     rootValue: 100,
                        //     propWhiteList: [],
                        // }),
                        cssnano({
                            zindex: false,
                            reduceIdents: false,
                            // safe: true
                        })
                    ]
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    optimization: {
        minimize: true
    },
    mode: 'production',
}