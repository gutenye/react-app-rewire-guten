require('pdjs')
const { getLoader, loaderNameMatches } = require('react-app-rewired')
const Compression = require('compression-webpack-plugin')
const paths = require('react-scripts/config/paths')
//const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = function(config, env) {
  const oneOfRules = config.module.rules.find((rule) => rule.oneOf !== undefined).oneOf

  // resolve.modules
  config.resolve.modules.unshift(paths.appSrc)

  // Disable eslint
  const eslintLoaderParent = config.module.rules[0]
  eslintLoaderParent.test = /DISABLED/

  // SVG
  oneOfRules.unshift(
    { test: /\.svg$/, use: ['babel-loader', {loader: '@gutenye/react-svg-loader', options: {es5: false, svgo: { pretty: true, plugins: [ { removeStyleElement: true } ] } }}] }
  )

  // SCSS
  // appSrc for _variables.scss
  //oneOfRules.unshift(
  //env === 'development' ?
  //{ test: /\.scss$/, use: ['style-loader', 'css-loader', {loader: 'sass-loader', options: {includePaths: [paths.appSrc, paths.appNodeModules]}}] } :
  //{ test: /\.scss$/, loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: ['css-loader', {loader: 'sass-loader', options: {includePaths: [paths.appSrc, paths.appNodeModules]}}]})}
  //)

  // Babel
  const babelLoader = getLoader(config.module.rules, rule => loaderNameMatches(rule, 'babel-loader'))
  if (env === 'development') {
    babelLoader.include = [babelLoader.include, /gureact/]
  }
  babelLoader.options.plugins = [
    require.resolve('babel-plugin-transform-decorators-legacy'),  // before transform-class-properties. needed by mobx
    require.resolve('babel-plugin-styled-components'),
    require.resolve('babel-plugin-lodash'),
    [require.resolve('babel-plugin-transform-imports'), {
      'gureact': { transform: 'gureact/src/core/${member}/${member}'},
      'gureact/antd': { transform: 'gureact/src/antd/${member}/${member}'},
      'gureact/antd-mobile': { transform: 'gureact/src/antd-mobile/${member}/${member}'},
      'gureact/commerce': { transform: 'gureact/src/commerce/${member}/${member}'},
      'gureact/mdc': { transform: 'gureact/src/mdc/${member}/${member}'},
      'react-icons': { transform: 'transform-imports-react-icons/index.js' },
      '@react-mdc': { transform: '@react-mdc/${member}', kebabCase: true },
      'date-fns': { transform: 'date-fns/${member}' },
      'yup': { transform: 'yup/lib/${member}' },
    }],
    [require.resolve('babel-plugin-import'), [
      { libraryName: 'antd', style: 'css' },
      { libraryName: 'antd-mobile', style: 'css' },
    ]],
  ]

  // Alias
  config.resolve.alias = Object.assign(config.resolve.alias, {
    'react-icon-base': '@gutenye/react-icon-base',
    'bcrypt': 'node-mocks/bcrypt',
  })
  if (env === 'production') {
    config.resolve.alias = Object.assign(config.resolve.alias, {
      'AppDesign': 'node-mocks/false',
    })
  }

  // Compression
  if (env === 'production') { config.plugins.push( new Compression()) }

  //console.log(JSON.stringify(config, null, 2))
  return config
}
