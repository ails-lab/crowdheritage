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
import { User } from 'User.js';
import { Record } from 'Record.js'

@inject(UserServices, Router,'loginPopup')
export class CampaignSummary {

	get isAuthenticated() { return this.userServices.isAuthenticated(); }
	get currentUser() { return this.userServices.current; }
	get progress() { return this.points/500 }

  constructor(userServices, router, loginPopup) {
  	this.userServices = userServices;
		this.router = router;
		this.lg = loginPopup;

		this.myProfile = false; // Is this my profile or another user's profile?
		this.user = null; // The owner of the profile
		// Contributions
		this.points = 0;
		this.created = 0;
		this.approved = 0;
		this.rejected = 0;
		this.annotatedRecordsCount = 0;
		this.records = [];
  }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  async activate(params, route) {
		if (this.userServices.isAuthenticated() && this.userServices.current === null) {
    	this.userServices.reloadCurrentUser();
    }
		if (this.currentUser && (params.uname == this.currentUser.username)) {
				this.myProfile = true;
				this.user = this.currentUser;
		} else {
			let userData = await this.userServices.getUserByUsername(params.uname);
			this.user = new User(userData);
		}
		route.navModel.setTitle(this.user.firstName + ' ' + this.user.lastName + " | CrowdHeritage");
		let contributions = await this.userServices.getUserAnnotations(this.user.dbId);
		this.points = contributions.annotationCount;
		this.created = contributions.createdCount;
		this.approved = contributions.approvedCount;
		this.rejected = contributions.rejectedCount;
		this.annotatedRecordsCount = contributions.annotatedRecordsCount;
  }

}
