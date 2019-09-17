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


import { inject, Container, PLATFORM } from 'aurelia-framework';
import { DialogService } from 'aurelia-dialog';
import { UserServices } from './modules/UserServices.js';
import { I18N } from 'aurelia-i18n';
import settings from 'global.config.js';
import less from 'less';

// The styles.less import is now obsolete
// We import it, through the color-set.less files
//import './../styles/styles.less';

@inject(DialogService, UserServices, Container, I18N)
export class App {

  constructor(dialogService, userServices, container, i18n) {
    // Load the desired locale
    this.i18n = i18n;
    /*this.i18n
        .setLocale('en')
        .then( () => {
      // locale is loaded
    });*/

    // Select the favicon and the color-set, according to the project
    var link = document.createElement('link');
    link.rel = "icon";
    link.type = "image/ico";
    if (settings.project == "WITHcrowd") {
      link.href = "/favicon1.ico";
      import('./../styles/withcrowd.less');
    }
    else if (settings.project == "CrowdHeritage") {
      link.type = "image/png";
      link.href = "/favicon2.ico";
      import('./../styles/crowdheritage.less');
    }
    document.head.appendChild(link);

    this.dialogService = dialogService;
    this.userServices = userServices;
    container.registerInstance('loginPopup', this.loginPopup.bind(this));
  }

  activate() {
		if (this.userServices.isAuthenticated() && this.userServices.current === null) {
			return Promise.all([
				this.userServices.reloadCurrentUser()
			]);
		}
	}

  // Properties
	get isAuthenticated() { return this.userServices.isAuthenticated(); }

  // UI Functions
  loginPopup() {
		this.dialogService.open({
			viewModel: PLATFORM.moduleName('widgets/logindialog/logindialog')
		}).then((response) => {
			if (!response.wasCancelled) {
				console.log('NYI - Login User');
			} else {
				console.log('Login cancelled');
			}
		});
	}

  configureRouter(config, router) {
    config.title = '';
    config.addPipelineStep('postcomplete', PostCompleteStep);
    config.options.pushState = true;
    config.options.root = '/';
    config.map([
      { route: ':lang?', href: 'index',            name: 'index',    	 moduleId: PLATFORM.moduleName('./pages/index/campaignIndex'),          nav: true,  title: settings.project },
      { route: ':lang/:cname',					           name: 'summary',    moduleId: PLATFORM.moduleName('./pages/summary/campaignSummary'),      nav: false, title: '' },
			{ route: ':lang/:cname/collection/:colid',   name: 'collection', moduleId: PLATFORM.moduleName('./pages/collection/collectionSummary'), nav: false, title: ''},
			{ route: ':lang/:cname/:recid',              name: 'item',     	 moduleId: PLATFORM.moduleName('./pages/item/campaignItem'),            nav: false, title: 'Annotate | '+settings.project, activationStrategy: 'replace' },
      { route: ':lang/register',                   name: 'register', 	 moduleId: PLATFORM.moduleName('./pages/register/register'),            nav: false, title: 'Register | '+settings.project},
      { route: ':lang/about', href: 'about',       name: 'about',    	 moduleId: PLATFORM.moduleName('./pages/about/about'),                  nav: true,  title: 'About | '+settings.project},
			{ route: ':lang/partners', href: 'partners', name: 'partners',   moduleId: PLATFORM.moduleName('./pages/partners/partners'),            nav: true,  title: 'Partners | '+settings.project},
			{ route: ':lang/privacy',                    name: 'privacy',  	 moduleId: PLATFORM.moduleName('./pages/privacy/privacy'),              nav: false, title: 'Privacy Policy | '+settings.project},
			{ route: ':lang/terms',                      name: 'terms',    	 moduleId: PLATFORM.moduleName('./pages/terms/terms'),                  nav: false, title: 'Terms and Conditions | '+settings.project},
			{ route: ':lang/user/:uname', 	             name: 'user',			 moduleId: PLATFORM.moduleName('./pages/user/userProfile'),				      nav: false, title: ''},
			{ route: ':lang/feedback',                   name: 'feedback',	 moduleId: PLATFORM.moduleName('./pages/feedback/feedback'),            nav: false, title: 'Feedback & Contact | '+settings.project}
    ]);

    this.router = router;
  }

}


class PostCompleteStep {
  run(routingContext, next) {
    try {
      if ( (routingContext.config.campaign.motivation) && (routingContext.config.campaign.motivation.includes('ColorTagging')) ) {
        // Do nothing
      }
      else {
        window.scrollTo(0,0);
      }
    }
    catch (e) {
      window.scrollTo(0,0);
    }

    return next();
  }
}
