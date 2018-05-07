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
        // js_lib: ["jquery", "bootstrap", "underscore"],
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, './dist/js')
    },
    mode: 'development',
    // devtool: '#inline-source-map',
    devtool: "cheap-module-eval-source-map",
    resolve: {
        modules: ["./node_modules"]
    },
    module: {
        rules: [
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
        new ExtractTextPlugin('../css/[name].css'),
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