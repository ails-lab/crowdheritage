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
import config from './conf/auth.config.js';

import '../styles/styles.css';
import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap';

// comment out if you don't want a Promise polyfill (remove also from webpack.common.js)
import * as Bluebird from 'bluebird';
Bluebird.config({ warnings: false });

export async function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .plugin('aurelia-animator-velocity', (instance) => {
			instance.options.duration = 200;
			instance.options.easing = 'linear';
			instance.enterAnimation = { properties: 'fadeIn', options: { easing: 'easeIn', duration: 100 } };
			instance.leaveAnimation = { properties: 'fadeOut', options: { easing: 'easeIn', duration: 100 } };
		})
    .plugin('aurelia-dialog', config => {
        config.useDefaults();
        config.settings.lock = true;
        config.settings.overlayDismiss = true;
        config.settings.startingZIndex = 5;
        config.settings.keyboard = true;
      })
    .plugin('aurelia-authentication', (baseConfig) => {
			baseConfig.configure(config);
		});

  // Uncomment the line below to enable animation.
  // aurelia.use.plugin('aurelia-animator-css');
  // if the css animator is enabled, add swap-order="after" to all router-view elements

  // Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  // aurelia.use.plugin('aurelia-html-import-template-loader')

  await aurelia.start();
  aurelia.setRoot('app');

  // if you would like your website to work offline (Service Worker),
  // install and enable the @easy-webpack/config-offline package in webpack.config.js and uncomment the following code:
  /*
  const offline = await System.import('offline-plugin/runtime');
  offline.install();
  */
}
