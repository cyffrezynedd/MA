// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    rules: {
      // Expo Router + modern tooling sometimes confuses import resolution in flat config on Windows.
      // We rely on TypeScript/Metro to validate module resolution.
      'import/no-unresolved': 'off',
    },
  },
]);
