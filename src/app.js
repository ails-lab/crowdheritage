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




import { inject,PLATFORM } from 'aurelia-framework';
import { DialogService } from 'aurelia-dialog';
import { UserServices } from './modules/UserServices.js';

import less from 'less';

import './../styles/styles.less';

@inject(DialogService, UserServices)
export class App {
  constructor(dialogService, userServices) {
    this.dialogService = dialogService;
    this.userServices = userServices;
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
			viewModel: PLATFORM.moduleName('widgets/logindialog/logindialog.js')
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
      { route: [ ':gname?'],    href: 'index',    name: 'index',    moduleId: PLATFORM.moduleName('./pages/index/campaignIndex'),     nav: true,  title: 'WITHcrowd' },
      { route: ':gname/:cname',        name: 'summary',  moduleId: PLATFORM.moduleName('./pages/summary/campaignSummary'), nav: false, title: '' },
      { route: ':gname/:cname/:recid', name: 'item',     moduleId: PLATFORM.moduleName('./pages/item/campaignItem'),       nav: false, title: 'Annotate | WITHcrowd', activationStrategy: 'replace' },
      { route: 'register',             name: 'register', moduleId: PLATFORM.moduleName('./pages/register/register'),       nav: false, title: 'Register | WITHcrowd' },
      { route: 'about',                name: 'about',    moduleId: PLATFORM.moduleName('./pages/about/about'),             nav: true,  title: 'About | WITHcrowd' },
      { route: 'privacy',              name: 'privacy',  moduleId: PLATFORM.moduleName('./pages/privacy/privacy'),         nav: false, title: 'Privacy Policy | WITHcrowd' },
			{ route: 'terms',                name: 'terms',    moduleId: PLATFORM.moduleName('./pages/terms/terms'),             nav: false, title: 'Terms and Conditions | WITHcrowd' },
			{ route: 'feedback',             name: 'feedback', moduleId: PLATFORM.moduleName('./pages/feedback/feedback'),       nav: false, title: 'Feedback & Contact | WITHcrowd' }
    ]);

    this.router = router;
  }

  goToCamp(camp) {
    let summary = this.router.routes.find(x => x.name === 'summary');
    summary.campaign = camp;
    this.router.navigateToRoute('summary', {cname: camp.username, gname: camp.spacename});
  }

}

class PostCompleteStep {
  run(routingContext, next) {
      window.scrollTo(0,0);

      return next();
  }
}
