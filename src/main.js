/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


// we want font-awesome to load as soon as possible to show the fa-spinner
import { AnimatorVelocity }  from 'aurelia-animator-velocity';
import { LogManager, PLATFORM } from 'aurelia-framework';
import { I18N, TCustomAttribute } from 'aurelia-i18n';
import Backend from 'i18next-xhr-backend';
import 'bootstrap';
import 'aurelia-validation';
import config from './conf/auth.config.js';

//import * as Bluebird from 'bluebird';
//Bluebird.config({ warnings: false });

// comment out if you don't want a Promise polyfill (remove also from webpack.common.js)


export async function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .plugin(PLATFORM.moduleName('aurelia-animator-velocity'), (instance) => {
			instance.options.duration = 200;
			instance.options.easing = 'linear';
			instance.enterAnimation = { properties: 'fadeIn', options: { easing: 'easeIn', duration: 100 } };
			instance.leaveAnimation = { properties: 'fadeOut', options: { easing: 'easeIn', duration: 100 } };
		})
		/*
    .plugin(PLATFORM.moduleName('aurelia-google-maps'), config => {
      config.options({
        apiKey: 'AIzaSyCE-H7wvtVwIt-0w92HpwHnIZppb7u2J_c', // use `false` to disable the key
        apiLibraries: '', //get optional libraries like drawing, geometry, ... - comma seperated list
        options: { panControl: true, panControlOptions: { position: 9 } }, //add google.maps.MapOptions on construct (https://developers.google.com/maps/documentation/javascript/3.exp/reference#MapOptions)
        language:'' | 'en', // default: uses browser configuration (recommended). Set this parameter to set another language (https://developers.google.com/maps/documentation/javascript/localization)
        region: '' | 'US', // default: it applies a default bias for application behavior towards the United States. (https://developers.google.com/maps/documentation/javascript/localization)
        markerCluster: {
          enable: false,
          src: 'https://cdn.rawgit.com/googlemaps/v3-utility-library/99a385c1/markerclusterer/src/markerclusterer.js', // self-hosting this file is highly recommended. (https://developers.google.com/maps/documentation/javascript/marker-clustering)
          imagePath: 'https://cdn.rawgit.com/googlemaps/v3-utility-library/tree/master/markerclusterer/images/m', // the base URL where the images representing the clusters will be found. The full URL will be: `{imagePath}{[1-5]}`.`{imageExtension}` e.g. `foo/1.png`. Self-hosting these images is highly recommended. (https://developers.google.com/maps/documentation/javascript/marker-clustering)
          imageExtension: 'png',
        }
      });
    })
    */
    .plugin(PLATFORM.moduleName('google-maps-api'), config => {
      config.options({
        apiKey: 'AIzaSyD4SpqL2DlfdiKJquVUmPnxPqFu56hChK8'
      })
    })
    .plugin(PLATFORM.moduleName('aurelia-dialog'), config => {
      config.useDefaults();
      config.settings.lock = true;
      config.settings.overlayDismiss = true;
      config.settings.startingZIndex = 5;
      config.settings.keyboard = true;
    })
    .plugin(PLATFORM.moduleName('aurelia-authentication'), (baseConfig) => {
			baseConfig.configure(config);
		})
    .plugin(PLATFORM.moduleName('aurelia-validation'))
    .plugin(PLATFORM.moduleName('aurelia-i18n'), instance => {
      let aliases = ['t', 'i18n'];
      // add aliases for 't' attribute
      TCustomAttribute.configureAliases(aliases);
      // register backend plugin
      instance.i18next.use(Backend);
      // adapt options to your needs (see http://i18next.com/docs/options/)
      // make sure to return the promise of the setup method, in order to guarantee proper loading
      return instance.setup({
        backend: {                                  // <-- configure backend settings
          loadPath: '/locales/{{lng}}/{{ns}}.json', // <-- XHR settings for where to get the files from
        },
        attributes: aliases,
        lng : 'en',
        fallbackLng : 'en',
        debug : false,
        ns: [
          'app',
          'about',
          'collectionEdit',
          'dashboard',
          'feedback',
          'index',
          'item',
          'partners',
          'privacy',
          'register',
          'summary',
          'terms',
          'user'
        ],
        defaultNS: 'app'
      });
    })
    .feature(PLATFORM.moduleName('converters/index'));// All ValueConverters are registered here


  // Uncomment the line below to enable animation.
  // aurelia.use.plugin('aurelia-animator-css');
  // if the css animator is enabled, add swap-order="after" to all router-view elements

  // Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  // aurelia.use.plugin('aurelia-html-import-template-loader')

 // await aurelia.start();
 // aurelia.setRoot('app');

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app'),document.body));


  // if you would like your website to work offline (Service Worker),
  // install and enable the @easy-webpack/config-offline package in webpack.config.js and uncomment the following code:
  /*
  const offline = await import('offline-plugin/runtime');
  offline.install();
  */
}
