module.exports = {
  cache: true,
  entry: './client/app',
  output: {
    filename: './public/js/app.js'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        }
      },
    ]
  }
};

