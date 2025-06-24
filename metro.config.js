const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Reduce file watching to prevent EMFILE errors
config.watchFolders = [];
config.watcher = {
  ignore: [
    /node_modules/,
    /\.git/,
    /\.expo/,
    /build/,
    /dist/,
    /coverage/
  ]
};

module.exports = config; 