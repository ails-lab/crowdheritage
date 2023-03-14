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
    this.project = settings.project;
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
    container.registerInstance('pageLocales', this.pageLocales.bind(this));
    container.registerInstance('colorPalette', this.colorPalette.bind(this));
  }

  activate() {
    document.documentElement.setAttribute("lang", this.locale);
		if (this.userServices.isAuthenticated() && this.userServices.current === null) {
			return Promise.all([
				this.userServices.reloadCurrentUser()
			]);
		}
	}

  // Properties
	get isAuthenticated() { return this.userServices.isAuthenticated(); }
  get locale() { return window.location.href.split('/')[3]; }

  configureRouter(config, router) {
    config.title = '';
    config.addPipelineStep('postcomplete', PostCompleteStep);
    config.options.pushState = true;
    config.options.root = '/';
    config.map([
      { route: ':lang?', href: 'index',            name: 'index',    	       moduleId: PLATFORM.moduleName('./pages/index/campaignIndex'),          nav: true,  title: settings.project },
      { route: ':lang/:cname',					           name: 'summary',          moduleId: PLATFORM.moduleName('./pages/summary/campaignSummary'),      nav: false, title: '' },
      { route: ':lang/:cname/moderation/:resource',name: 'moderation',	     moduleId: PLATFORM.moduleName('./pages/moderation/moderation'),        nav: false, title: 'Campaign Moderation | '+settings.project},
			{ route: ':lang/:cname/collection/:colid',   name: 'collection',       moduleId: PLATFORM.moduleName('./pages/collection/collectionSummary'), nav: false, title: ''},
			{ route: ':lang/:cname/:recid',              name: 'item',     	       moduleId: PLATFORM.moduleName('./pages/item/campaignItem'),            nav: false, title: 'Annotate | '+settings.project, activationStrategy: 'replace' },
      { route: ':lang/register',                   name: 'register', 	       moduleId: PLATFORM.moduleName('./pages/register/register'),            nav: false, title: 'Register | '+settings.project},
      { route: ':lang/resetPassword',              name: 'resetPassword', 	 moduleId: PLATFORM.moduleName('./pages/resetPassword/resetPassword'),  nav: false, title: 'Reset Password | '+settings.project},
      { route: ':lang/about', href: 'about',       name: 'about',    	       moduleId: PLATFORM.moduleName('./pages/about/about'),                  nav: true,  title: 'About | '+settings.project},
			{ route: ':lang/partners', href: 'partners', name: 'partners',         moduleId: PLATFORM.moduleName('./pages/partners/partners'),            nav: true,  title: 'Partners | '+settings.project},
			{ route: ':lang/privacy',                    name: 'privacy',  	       moduleId: PLATFORM.moduleName('./pages/privacy/privacy'),              nav: false, title: 'Privacy Policy | '+settings.project},
			{ route: ':lang/terms',                      name: 'terms',    	       moduleId: PLATFORM.moduleName('./pages/terms/terms'),                  nav: false, title: 'Terms and Conditions | '+settings.project},
			{ route: ':lang/user/:userId', 	             name: 'user',			       moduleId: PLATFORM.moduleName('./pages/user/userProfile'),				      nav: false, title: ''},
			{ route: ':lang/feedback',                   name: 'feedback',	       moduleId: PLATFORM.moduleName('./pages/feedback/feedback'),            nav: false, title: 'Feedback & Contact | '+settings.project},
      { route: ':lang/dashboard/:resource',        name: 'dashboard',	       moduleId: PLATFORM.moduleName('./pages/dashboard/dashboard'),          nav: false, title: 'Dashboard | '+settings.project},
      { route: ':lang/collection-edit/:colid',     name: 'collection-edit',	 moduleId: PLATFORM.moduleName('./pages/collection-edit/collection-edit'), nav: false, title: ''},
      { route: ':lang/campaign-edit/:cname',       name: 'campaign-edit',	   moduleId: PLATFORM.moduleName('./pages/campaign-edit/campaign-edit'),  nav: false, title: ''},
      { route: ':lang/vocabulary-edit/:vname',     name: 'vocabulary-edit',	 moduleId: PLATFORM.moduleName('./pages/vocabulary-edit/vocabulary-edit'),  nav: false, title: ''}
    ]);

    this.router = router;
  }

  // Global functions
  loginPopup() {
		this.dialogService.open({
			viewModel: PLATFORM.moduleName('widgets/logindialog/logindialog')
		}).then((response) => {
			if (!response.wasCancelled) {
				console.log('NYI - Login User');
        this.cookiesPopup();
			} else {
				console.log('Login cancelled');
			}
		});
	}
  
  cookiesPopup() {
    this.dialogService.open({
      viewModel: PLATFORM.moduleName('widgets/cookiesDialog/cookiesDialog'),
      overlayDismiss: false
    });
  }

  pageLocales() {
    return [
      { title: "English",     code: "en", flag: "/img/assets/images/flags/en.png" },
      { title: "Italiano",    code: "it", flag: "/img/assets/images/flags/it.png" },
      { title: "Français",    code: "fr", flag: "/img/assets/images/flags/fr.png" },
      { title: "Español",     code: "es", flag: "/img/assets/images/flags/es.png" },
      { title: "Polszczyzna", code: "pl", flag: "/img/assets/images/flags/pl.png" },
      { title: "Ελληνικά",    code: "el", flag: "/img/assets/images/flags/el.png" }
      //{ title: "Deutsch",     code: "de", flag: "/img/assets/images/flags/de.png" },
      //{ title: "Nederlands",  code: "nl", flag: "/img/assets/images/flags/nl.png" },
    ];
  }
  colorPalette() {
    return [
      ["Black",       "background-color: #111111", "color: #111111; filter: brightness(500%);"],
      ["Grey",        "background-color: #AAAAAA", "color: #AAAAAA; filter: brightness(60%);"],
      ["Brown",       "background-color: brown", "color:brown; filter: brightness(60%);"],
      ["Red",         "background-color: #FF4136", "color: #FF4136; filter: brightness(60%);"],
      ["Orange",      "background-color: #FF851B", "color: #FF851B; filter: brightness(60%);"],
      ["Beige",       "background-color: beige", "color: beige; filter: brightness(60%);"],
      ["Yellow",      "background-color: #FFDC00", "color: #FFDC00; filter: brightness(60%);"],
      ["Green",       "background-color: #2ECC40", "color: #2ECC40; filter: brightness(60%);"],
      ["Blue",        "background-color: #0074D9", "color: #0074D9; filter: brightness(60%);"],
      ["Purple",      "background-color: #B10DC9", "color: #B10DC9; filter: brightness(60%);"],
      ["Pink",        "background-color: pink", "color: pink; filter: brightness(60%);"],
      ["White",       "background-color: #FFFFFF", "color: #FFFFFF; filter: brightness(60%);"],
      ["Copper",      "background-image: url(/img/color/copper.jpg)", "color: #b87333; filter: brightness(50%);"],
      ["Silver",      "background-image: url(/img/color/silver.jpg)", "color:  #DDDDDD; filter: brightness(30%);"],
      ["Bronze",      "background-image: url(/img/color/bronze.jpg)", "color: #cd7f32; filter: brightness(50%);"],
      ["Gold",        "background-image: url(/img/color/gold.jpg)", "color: #FFD700; filter: brightness(50%);"],
      ["Multicolor",  "background-image: linear-gradient(to right, red,orange,yellow,green,blue,indigo,violet)", " color: white; text-shadow: 1px 1px 2px #424242;"],
      ["Transparent", "", "color: white; text-shadow: 1px 1px 2px #424242;"]
    ];
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
