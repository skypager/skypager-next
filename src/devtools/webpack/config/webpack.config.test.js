const merge = require('webpack-merge')
const paths = require('./paths')
const SourceMapSupport = require('webpack-source-map-support')
const nodeExternals = require('webpack-node-externals')
const { DefinePlugin } = require('webpack')

const config = require('./webpack.config')('development', {
  hot: false,
  minifyJS: false,
  minifyCSS: false,
})

const { name, version } = require(paths.appPackageJson)

config.plugins = config.plugins.filter(p => {
  if (p.constructor && p.constructor.name === 'DefinePlugin' && p.definitions['process.env']) {
    return false
  } else {
    return true
  }
})

const webpackConfig = merge(config, {
  context: paths.appRoot,
  devtool: '#cheap-module-eval-source-map',
  output: {
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
  },
  externals: [
    {
      '@skypager/node': 'commonjs2 @skypager/node',
      '@skypager/features-file-manager': 'commonjs2 @skypager/features-file-manager',
      watch: 'commonjs2 watch',
      'aws-sdk': 'commonjs2 aws-sdk',
      fsevents: 'commonjs2 fsevents',
      'child-process-promise': 'commonjs2 child-process-promise',
      'fs-extra-promise': 'commonjs2 fs-extra-promise',
    },
    nodeExternals({ modulesFromFile: true }),
    nodeExternals({ modulesFromFile: false, modulesDir: paths.portfolioNodeModules }),
  ],
  plugins: [new SourceMapSupport(), new DefinePlugin({ __PACKAGE__: { name, version } })],
})

module.exports = webpackConfig
