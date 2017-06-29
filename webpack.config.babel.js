/**
 * To learn more about how to use Easy Webpack
 * Take a look at the README here: https://github.com/easy-webpack/core
 **/
import { generateConfig, get, stripMetadata, EasyWebpackConfig } from '@easy-webpack/core'

import envProd from '@easy-webpack/config-env-production'
import envDev from '@easy-webpack/config-env-development'
import aurelia from '@easy-webpack/config-aurelia'
import babel from '@easy-webpack/config-babel'
import html from '@easy-webpack/config-html'
import css from '@easy-webpack/config-css'
import fontAndImages from '@easy-webpack/config-fonts-and-images'
import globalBluebird from '@easy-webpack/config-global-bluebird'
import globalJquery from '@easy-webpack/config-global-jquery'
import globalRegenerator from '@easy-webpack/config-global-regenerator'
import generateIndexHtml from '@easy-webpack/config-generate-index-html'
import commonChunksOptimize from '@easy-webpack/config-common-chunks-simple'
import copyFiles from '@easy-webpack/config-copy-files'
import uglify from '@easy-webpack/config-uglify'
import generateCoverage from '@easy-webpack/config-test-coverage-istanbul'

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AureliaWebpackPlugin = require('aurelia-webpack-plugin');
const project = require('./package.json');

process.env.BABEL_ENV = 'webpack'
const ENV = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() || (process.env.NODE_ENV = 'development')

// basic configuration:
const title = 'WITHcrowd'
const baseUrl = '/'
const rootDir = path.resolve()
const srcDir = path.resolve('src')
const outDir = path.resolve('dist')

const coreBundles = {
  bootstrap: [
    'aurelia-bootstrapper-webpack',
    'aurelia-polyfills',
    'aurelia-pal',
    'aurelia-pal-browser',
    'regenerator-runtime',
    'bluebird'
  ],
  // these will be included in the 'aurelia' bundle (except for the above bootstrap packages)
  aurelia: [
    'aurelia-bootstrapper-webpack',
    'aurelia-binding',
    'aurelia-dependency-injection',
    'aurelia-event-aggregator',
    'aurelia-framework',
    'aurelia-history',
    'aurelia-history-browser',
    'aurelia-loader',
    'aurelia-loader-webpack',
    'aurelia-logging',
    'aurelia-logging-console',
    'aurelia-metadata',
    'aurelia-pal',
    'aurelia-pal-browser',
    'aurelia-path',
    'aurelia-polyfills',
    'aurelia-route-recognizer',
    'aurelia-router',
    'aurelia-task-queue',
    'aurelia-templating',
    'aurelia-templating-binding',
    'aurelia-templating-router',
    'aurelia-templating-resources'
  ]
}

module.exports = {
		entry: {
            'app': [], // <-- this array will be filled by the aurelia-webpack-plugin
            'aurelia': Object.keys(project.dependencies).filter(dep => dep.startsWith('aurelia-'))
        },
        output: {
            path: path.resolve('dist'),
            filename: '[name].bundle.js'
        },
        module: {
           rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    options: {
                        ignore: '/node_modules/'        
                      },
                    query: {
                        presets: [
                            [ 'es2015', {
                                loose: true, // this helps simplify javascript transformation
                                module: false // this helps enable tree shaking for webpack 2
                            }],
                            'stage-1'
                        ],
                        plugins: ['transform-runtime','transform-decorators-legacy']
                    }
                },
                {
                    test: /\.html$/,
                    exclude: /index\.html$/, // index.html will be taken care by HtmlWebpackPlugin
                    use: [
                        'raw-loader',
                        'html-minifier-loader'
                    ]
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.(png|jpe?g|gif|svg|eot|woff|woff2|ttf)$/,
                    use: 'url-loader'
                }
               			
            ]
        },
        plugins: [
            new webpack.ProvidePlugin({
                regeneratorRuntime: 'regenerator-runtime', // to support await/async syntax
                Promise: 'bluebird', // because Edge browser has slow native Promise object
                $: 'jquery', // because 'bootstrap' by Twitter depends on this
                jQuery: 'jquery'
            }),
            new HtmlWebpackPlugin({
                template: 'index.html'
            }),
            new AureliaWebpackPlugin({
                root: path.resolve(),
                src: path.resolve('src'),
                baseUrl: '/'
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: ['aurelia']
            }),
            new webpack.LoaderOptionsPlugin({
            options: {
                context: __dirname,
                'html-minifier-loader': {
                    removeComments: true,               // remove all comments
                    collapseWhitespace: true,           // collapse white space between block elements (div, header, footer, p etc...)
                    collapseInlineTagWhitespace: true,  // collapse white space between inline elements (button, span, i, b, a etc...)
                    collapseBooleanAttributes: true,    // <input required="required"/> => <input required />
                    removeAttributeQuotes: true,        // <input class="abcd" /> => <input class=abcd />
                    minifyCSS: true,                    // <input style="display: inline-block; width: 50px;" /> => <input style="display:inline-block;width:50px;"/>
                    minifyJS: true,                     // same with CSS but for javascript
                    removeScriptTypeAttributes: true,   // <script type="text/javascript"> => <script>
                    removeStyleLinkTypeAttributes: true // <link type="text/css" /> => <link />
                }
            }
            }),
            new webpack.optimize.UglifyJsPlugin({
              mangle: { screw_ie8: true, keep_fnames: true},
              dead_code: true,
              unused: true,
              comments: true,
              compress: {
                  screw_ie8: true,
                  keep_fnames: true,
                  drop_debugger: false,
                  dead_code: false,
                  unused: false,
                  warnings: false
              }
            })
        ]
    };

/**
 * Main Webpack Configuration
 */
let config = generateConfig(
  {
    entry: {
      'app': ['./src/main' /* this is filled by the aurelia-webpack-plugin */],
      'aurelia-bootstrap': coreBundles.bootstrap,
      'aurelia': coreBundles.aurelia.filter(pkg => coreBundles.bootstrap.indexOf(pkg) === -1)
    },
    output: {
      path: outDir
    },
    resolve: {
        alias: {
	    	 'masonry': 'masonry-layout',
	         'isotope': 'isotope-layout'
	    	
	    }
    },
    node: {
      fs: "empty"
    }
  },

  /**
   * Don't be afraid, you can put bits of standard Webpack configuration here
   * (or at the end, after the last parameter, so it won't get overwritten by the presets)
   * Because that's all easy-webpack configs are - snippets of premade, maintained configuration parts!
   *
   * For Webpack docs, see: https://webpack.js.org/configuration/
   */

  ENV === 'test' || ENV === 'development' ?
    envDev(ENV !== 'test' ? {} : {devtool: 'inline-source-map'}) :
    envProd({ /* devtool: '...' */ }),

  aurelia({root: rootDir, src: srcDir, title: title, baseUrl: baseUrl}),

  babel({ options: { /* uses settings from .babelrc */ } }),
  html(),
  css({ filename: 'styles.css', allChunks: true, sourceMap: false }),
  fontAndImages(),
  globalBluebird(),
  globalJquery(),
  globalRegenerator(),
  generateIndexHtml({minify: ENV === 'production'}),

  ...(ENV === 'production' || ENV === 'development' ? [
    commonChunksOptimize({appChunkName: 'app', firstChunk: 'aurelia-bootstrap'}),
    copyFiles({patterns: [{ from: 'favicon.ico', to: 'favicon.ico' }]})
  ] : [
    /* ENV === 'test' */
    generateCoverage({ options: { 'force-sourcemap': true, esModules: true }})
  ]),

  ENV === 'production' ?
    uglify({debug: false, mangle: { except: ['cb', '__webpack_require__'] }}) : {}
)

module.exports = stripMetadata(config)


