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


import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { UserServices } from 'UserServices';

@inject(UserServices, Router,'loginPopup')
export class CampaignSummary {

	get isAuthenticated() { return this.userServices.isAuthenticated(); }
	get currentUser() { return this.userServices.current; }

  constructor(userServices, router, loginPopup) {
  	this.userServices = userServices;
		this.router = router;
		this.lg = loginPopup;

		this.myProfile = false; // Is this my profile or another user's profile?
		this.user = null; // The owner of the profile
  }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  activate(params, route) {
		if (params.uname == 'me') {
			if (!this.isAuthenticated)
				return this.lg.call();
			this.myProfile = true;
			this.user = this.currentUser;
		}
		route.navModel.setTitle(this.user.firstName + ' ' + this.user.lastName + " | WITHcrowd");
  }

}