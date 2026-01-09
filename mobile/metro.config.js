const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    ...defaultConfig.resolver,
    // Block debugger UI files that may cause resolution errors
    blockList: Array.isArray(defaultConfig.resolver.blockList)
      ? [...defaultConfig.resolver.blockList, /.*\/debugger-ui\/.*/]
      : [/.*\/debugger-ui\/.*/],
  },
};

module.exports = mergeConfig(defaultConfig, config);

