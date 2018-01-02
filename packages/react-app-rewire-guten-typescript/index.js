const paths = require('react-scripts/config/paths')
const TsImportPlugin = require('ts-import-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const rewireGuten = require('react-app-rewire-guten')
const path = require('path')
const fs = require('fs')

module.exports = function(config, env) {
  const oneOfRules = config.module.rules.find((rule) => rule.oneOf !== undefined).oneOf

  config = rewireGuten(config, env)


  // paths
  Object.assign(paths, {
    appIndexJs: resolveApp('src/index.tsx'),
    testsSetup: resolveApp('src/setupTests.ts'),
    appTsConfig: resolveApp('tsconfig.json'),
    appTsLint: resolveApp('tslint.json'),
  })

  // entry
  config.entry[config.entry.length - 1] = paths.appIndexJs

  // resolve.extensions
  config.resolve.extensions.unshift('.web.ts', '.ts', '.web.tsx', '.tsx')

  // ts-loader
  oneOfRules.unshift({
    test: /\.tsx?$/,
    include: paths.appSrc,
    use: [
      {
        loader: require.resolve('ts-loader'),
        options: {
          happyPackMode: true,
          getCustomTransformers: () => (
            {
            before: [ TsImportPlugin([
              { libraryName: 'antd-mobile', libraryDirectory: 'es', style: 'css' },
              { libraryName: 'antd', libraryDirectory: 'es', style: 'css' },
            ])]
          })
        }
      }
    ]
  })

  // plugins
  config.plugins.unshift(
    new ForkTsCheckerWebpackPlugin({
      async: false,
      watch: paths.appSrc,
      tsconfig: paths.appTsConfig,
      //tslint: paths.appTsLint,
    })
  )

  return config
}

function resolveApp(relativePath) { return path.resolve(fs.realpathSync(process.cwd()), relativePath) }
