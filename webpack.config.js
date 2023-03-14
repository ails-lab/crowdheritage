const path = require('path');
const { AureliaPlugin, ModuleDependenciesPlugin} = require("aurelia-webpack-plugin");

var webpack = require('webpack');
var ProvidePlugin = require('webpack/lib/ProvidePlugin');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ensureArray = (config) => config && (Array.isArray(config) ? config : [config]) || []
const when = (condition, config, negativeConfig) => condition ? ensureArray(config) : ensureArray(negativeConfig)

const dotenv = require('dotenv').config({path: __dirname + '/.env'});
const isProduction = process.env.production === true;
const platform = process.env.platform // 'default' by default
const ENV = process.env.production == true ? 'production' : 'development';
var project = require('./package.json');

//basic configuration:
var title = 'CrowdHeritage';
var rootDir = path.resolve();
const outDir = path.resolve(__dirname, 'dist');
const publicpath=path.resolve(__dirname, 'public');
const srcDir = path.resolve(__dirname, 'src');
const nodeModulesDir = path.resolve(__dirname, 'node_modules');
const baseUrl = '/';

const coreBundles = {
  bootstrap: [
    'aurelia-polyfills',
    'aurelia-pal',
    'aurelia-pal-browser',
    'regenerator-runtime',
    'bluebird'
  ],
  // these will be included in the 'aurelia' bundle (except for the above bootstrap packages)
  aurelia: [
  	'aurelia-api',
  	'aurelia-authentication',
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
};

const cssRules = [
  { loader: 'css-loader' },
  {
    loader: 'postcss-loader',
    options: { plugins: () => [require('autoprefixer')({ browsers: ['last 2 versions'] })]}
  }
];

const aureliaModules = Object.keys(project.dependencies).filter(dep => dep.startsWith('aurelia-'));

process.noDeprecation = true;

module.exports = ({production, server, extractCss, coverage} = {}) => ({

  entry: {
    //'app': [], // <-- this array will be filled by the aurelia-webpack-plugin
    'main': [ 'aurelia-bootstrapper' ]
    //'aurelia': Object.keys(project.dependencies).filter(dep => dep.startsWith('aurelia-'))
  },

  resolve: {
    extensions: ['.js', '.jsx','.less','.css'],
    modules: ["js/vendor","styles","src","src/pages","src/modules","src/widgets","src/utils","src/conf", "node_modules"].map(x => path.resolve(x)),
    /*  alias: {
    	'jquery.shorten': __dirname + '/node_modules/jquery.shorten/src/jquery.shorten.js',
    	'jquery.magnific-popup': __dirname + '/node_modules/magnific-popup/dist/jquery.magnific-popup.js'
    }*/
  },

  output: {
    path: outDir,
    publicPath: baseUrl,
    filename: '[name].js',
    chunkFilename: '[name].js'
  },

  devServer: {
    historyApiFallback: true,
    //stats: 'errors-only',
    open: true,
    port: 8080,
    static: {
     staticOptions: {
      redirect: false
     }
    }
  },

  performance: {
    hints: false
  },

  plugins: [
    new AureliaPlugin({
      root: rootDir,
      src: srcDir,
      title: title,
      baseUrl: baseUrl
    }),
    new ModuleDependenciesPlugin({
      'aurelia-authentication': [ './authFilterValueConverter' ]
    }),
    new webpack.ProvidePlugin({
      regeneratorRuntime: 'regenerator-runtime', // to support await/async syntax
      //Promise: 'bluebird', // because Edge browser has slow native Promise object
      $: 'jquery', // because 'bootstrap' by Twitter depends on this
      jQuery: 'jquery',
      toastr: 'toastr',
      'window.jQuery': 'jquery'
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.parsed)
    }),
    new HtmlWebpackPlugin({
      template: '!html-webpack-plugin/lib/loader!index.html',
      title: title,
      baseUrl: baseUrl,
      ENV: JSON.stringify(ENV),
      inject: true,
      sourceMap: true
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
    new CopyWebpackPlugin(
      { 
        patterns:[
      { from: 'src/locales/', to: 'locales/' }, // Multilinguality
      { from: 'img', to: 'img' },
      { from: 'js', to: 'js' },
      { from: 'styles', to: 'styles' }
      /*,
      { from: 'node_modules/please-wait', to: 'node_modules/please-wait' },
      { from: 'node_modules/spinkit', to: 'node_modules/spinkit' }
      */
    ]}),
    ...when(extractCss, new ExtractTextPlugin({
      filename: production ? '[contenthash].css' : '[id].css',
      allChunks: true,
    })),
    ...when(production, ({optimization: {
      minimize: true,
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          default: false,
          commons: {
            test: /node_modules/,
            name: "vendor",
            chunks: "initial",
            minSize: 1
          }
        }
      }
    }
    }))
  ],

  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.json?$/,
        loader: 'json-loader'
      },
      /*
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
      */
      {
        test: /\.css$/i,
        issuer: [{ not: [{ test: /\.html$/i }] }],
        use: extractCss ? ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: cssRules,
        }) : ['style-loader', ...cssRules],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader' // creates style nodes from JS strings
          },
          {
            loader: 'css-loader' // translates CSS into CommonJS
          },
            {
            loader: 'less-loader' // compiles Less to CSS
          }
        ]
      },
      {
        test: /\.css$/i,
        issuer: [{ test: /\.html$/i }],
        // CSS required in templates cannot be extracted safely
        // because Aurelia would try to require it again in runtime
        use: cssRules,
      },
      {
        test: /\.html$/i,
        loader: 'html-loader'
      },
      {
    	  test: /\.js$/i, loader: 'babel-loader',
    	  exclude: nodeModulesDir,
        query: {
          presets:['env'],
          plugins: ['css-modules-transform','transform-class-properties','transform-decorators-legacy','syntax-dynamic-import']
        }
      },
      { test: /\.json$/i, loader: 'json-loader' },
      //{ test: /[\/\\]node_modules[\/\\]bluebird[\/\\].+\.js$/, loader: 'expose-loader?Promise' },
      { test: require.resolve('jquery'), loader: 'expose-loader?$!expose-loader?jQuery' },
      { test: /\.(png|gif|jpe?g|cur)$/i, loader: 'url-loader', options: {limit: 8192} },
      { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff2' } },
      { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } },
      // load these fonts normally, as files:
      { test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, use: [ 'file-loader'] }
    ]
  },

  node: {
    fs: "empty",
    net: 'empty',
    tls: 'empty'
  }

});

//  aurelia({root: rootDir, src: srcDir, title: title, baseUrl: baseUrl}),
