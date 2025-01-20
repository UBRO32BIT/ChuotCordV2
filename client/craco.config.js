const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const forkTsCheckerPlugin = webpackConfig.plugins.find(
        (plugin) => plugin.constructor.name === 'ForkTsCheckerWebpackPlugin'
      );

      if (forkTsCheckerPlugin) {
        forkTsCheckerPlugin.options.workers = 1; // Reduce workers
      }

      return webpackConfig;
    },
  },
};