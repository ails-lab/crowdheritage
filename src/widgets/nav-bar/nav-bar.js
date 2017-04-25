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


import { bindable, inject } from 'aurelia-framework';
import { UserServices } from '../../modules/UserServices.js';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DialogService } from 'aurelia-dialog';

@inject(UserServices, Router, EventAggregator, DialogService)
export class NavBar {

  @bindable router = null;

  constructor(userServices, router, eventAggregator, dialogService) {
		this.userServices = userServices;
		this.router = router;
		this.locked = false;
		this.ea = eventAggregator;
		this.dialogService = dialogService;
	}

  // Properties
	get isAuthenticated() { return this.userServices.isAuthenticated(); }
	get user() { return this.userServices.current; }

  asdf() {
    alert("asdf");
  }

  // UI Functions
  loginPopup() {
		this.dialogService.open({
			viewModel: 'widgets/logindialog/logindialog.js'
		}).then((response) => {
			if (!response.wasCancelled) {
				console.log('NYI - Login User');
			} else {
				console.log('Login cancelled');
			}
		});
	}
}
