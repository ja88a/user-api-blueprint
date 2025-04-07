const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: {
    'bundle': './dist/index.js',
  },
  target: ['node18'],
  optimization: {
    minimize: true,
  },
  devtool: 'source-map',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'production',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [],

  experiments: {
    outputModule: true
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
    library: {
      type: 'module'
    }
  },
};
