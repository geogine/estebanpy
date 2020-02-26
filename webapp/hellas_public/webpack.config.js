var path = require('path');


module.exports = {
  mode: 'production',
  entry: {
    geopoly: './client/geopoly.js',
    //worldmap: './client/worldmap.js',
    admin: './client/admin.js',
  },
  resolve: {
    alias: {
      '/client': path.resolve(__dirname, 'client/'),
      '/engine': path.resolve(__dirname, 'engine/'),
    }
  },
  output: {
    path: __dirname + "/js",
    filename: '[name].min.js',

    libraryExport: 'default',
    libraryTarget: 'umd',
    library: '[name]',
    globalObject: 'this',
  }
};
