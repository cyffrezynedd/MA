// Metro configuration for Expo
// Adds support for importing .wasm assets (needed by expo-sqlite on web).

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts = config.resolver.assetExts || [];
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

/**
 * Firebase JS: @firebase/firestore объявляет `main` → index.node.cjs.js (Node).
 * Metro/Web часто выбирают его и падают на отсутствующие/неподходящие common-*.node чанки.
 * Явно уводим на ESM-бандл браузера. Условия `exports` задаёт Expo (`unstable_conditionsByPlatform`).
 */
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform, ...rest) => {
  // Только нативные таргеты: RN-сборка Firestore. На web Metro должен брать `exports.browser`
  // (index.esm.js), иначе общий бандл тянет неверные Babel-хелперы и падает ExpoRoot.
  if (moduleName === '@firebase/firestore' && platform !== 'web') {
    return {
      filePath: path.join(__dirname, 'node_modules/@firebase/firestore/dist/index.rn.js'),
      type: 'sourceFile',
    };
  }
  if (typeof defaultResolveRequest === 'function') {
    return defaultResolveRequest(context, moduleName, platform, ...rest);
  }
  return context.resolveRequest(context, moduleName, platform, ...rest);
};

// Не задавать resolver.unstable_conditionNames глобально: Expo уже выставляет
// unstable_conditionsByPlatform (web → browser, ios/android → react-native).
// Глобальный список с react-native ломает web-резолв для package "exports"
// (@babel/runtime/helpers → «_objectWithoutPropertiesLoose is not a function» в ExpoRoot).

if (!config.resolver.sourceExts.includes('cjs')) {
  config.resolver.sourceExts.push('cjs');
}
module.exports = config;
