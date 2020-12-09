const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoPlugin = require('monaco-editor-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {

  // webpack will take the files from ./src/index
  entry: './src/index',
  devtool: isDevelopment ? 'inline-source-map' : 'source-map',
  mode: isDevelopment ? 'development' : 'production',

  // and output it into /dist as bundle.js
  output: {
    path: path.join(__dirname, '/dist'),
    filename: isDevelopment ? '[name].bundle.js' : '[name].bundle.[contenthash].js',
    publicPath: '/',
  },

  devServer: {
    historyApiFallback: true,
    hot: true,
    port: 8080,
    compress: true,
  },

  // adding .ts and .tsx to resolve.extensions will help babel look for .ts and .tsx files to transpile
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },

  module: {
    rules: [

        // we use babel-loader to load our jsx and tsx files
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              isDevelopment && require.resolve('react-refresh/babel'),
            ].filter(Boolean),
          },
        },
      },

      // css-loader to bundle all the css files into one file and style-loader to add all the styles  inside the style tag of the document
      {
        test: /\.scss$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {loader: 'css-loader', options: {sourceMap: true, importLoaders: 1}},
          {loader: 'postcss-loader', options: {sourceMap: true}},
          {loader: 'sass-loader', options: {sourceMap: true}},
        ],
      },
      {
        test: /\.css$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {loader: 'css-loader', options: {sourceMap: true, importLoaders: 1}},
          {loader: 'postcss-loader', options: {sourceMap: true}},
        ],
      }, {
        test: /\.ttf/,
        use: 'file-loader',
      }
    ]
  },
  optimization: isDevelopment ? undefined : {
    minimize: true,
    minimizer: ['...', new CssMinimizerPlugin()],
    runtimeChunk: {
      name: 'runtime',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    isDevelopment && new ReactRefreshWebpackPlugin(),
    new MonacoPlugin(),
    !isDevelopment && new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css',
      chunkFilename: '[id].css',
    }),
  ].filter(Boolean)
};
