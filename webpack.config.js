const webpack = require('webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const ManifestPlugin = require('webpack-manifest-plugin');

module.exports = {
    entry: {
        app: [
            './src/js/app.js',
            './src/sass/app.scss',
        ]
    },
    devServer: {
        historyApiFallback: true,
        inline: true,
        hot: true,
        contentBase: './public',
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        },
    },
    output: {
        filename: '[name].js',
        // path: path.join(__dirname, './dist/js')
        path: path.join(__dirname, 'public')
    },
    mode: 'development',
    resolve: {
        modules: ["./node_modules"]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['env', {
                                'targets': {
                                    'browsers': ['last 2 versions', 'IE > 10']
                                }
                            }]
                        ]
                    }
                }
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [ 'css-loader', 'sass-loader' ]
                })
            },
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        // new ExtractTextPlugin('../css/[name].css'),
        new ExtractTextPlugin(path.resolve(__dirname, 'public/[name].css')),
        // new webpack.ProvidePlugin({
        //     $: "jquery",
        //     jQuery: "jquery"
        // }),
        // new ManifestPlugin(),
        new UglifyJSPlugin(),
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'js_lib',
        //     minChunks: function (module) {
        //         return module.context && module.context.indexOf('node_modules') !== -1;
        //     }
        // }),
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'manifest'
        // }),
    ]
}