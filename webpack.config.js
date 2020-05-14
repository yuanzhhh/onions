const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin')

const { NODE_ENV } = process.env;

module.exports = {
    mode: NODE_ENV === 'production' ? 'production' : 'development',
    module: {
        rules: [
            { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
        ],
    },
    entry: {
        index: [
            './lib/index.js',
        ],
    },
    optimization: {
        minimize: NODE_ENV === 'production',
        minimizer: [
            new TerserPlugin({
                parallel: true,
                cache: false,
            }),
        ],
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: `onions${NODE_ENV === 'production' ? '.min' : ''}.js`,
        library: 'Onions',
        libraryTarget: 'umd',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.HashedModuleIdsPlugin(),
    ]
}
