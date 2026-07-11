const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude test files from being processed by the Metro bundler
config.resolver.blockList = [
  /.*\.(test|spec)\.(js|jsx|ts|tsx)$/,
  /__tests__\/.*/,
];

module.exports = config;
