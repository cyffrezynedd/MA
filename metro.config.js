// Metro configuration for Expo
// Adds support for importing .wasm assets (needed by expo-sqlite on web).

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts = config.resolver.assetExts || [];
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

module.exports = config;

