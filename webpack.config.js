const path = require('path');

module.exports = {
//   entry: './src/index.js',
    mode: 'development',
    devtool: '#inline-source-map',
    entry: {
        app: './src/js/app.js',
        venders: './src/js/vendors.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/js'),
        chunkFilename: '[id].[chunkhash].js'
    }
};