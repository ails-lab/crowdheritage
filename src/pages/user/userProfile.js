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


import { inject, LogManager, NewInstance } from 'aurelia-framework';
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { UserServices } from 'UserServices';
import { MediaServices } from 'MediaServices.js';
import { Router } from 'aurelia-router';
import { User } from 'User.js';
import { Record } from 'Record.js'
import { I18N } from 'aurelia-i18n';
import settings from 'global.config.js';

let logger = LogManager.getLogger('UserProfile.js');

@inject(UserServices, MediaServices, Router, I18N, 'loginPopup', NewInstance.of(ValidationController))
export class UserProfile {

	get isAuthenticated() { return this.userServices.isAuthenticated(); }
	get currentUser() { return this.userServices.current; }
	get progress() { return (100*this.points/500) }
	get barLevel() { return ( this.progress<=100 ? this.progress : 100 ) }
	get hasErrors() { return !!this.errors.length; }

  constructor(userServices, mediaServices, router, i18n, loginPopup, validationController) {
  	this.userServices = userServices;
		this.mediaServices = mediaServices;
		this.validationController = validationController;
		this.router = router;
		this.lg = loginPopup;
		this.project = settings.project;
		this.i18n = i18n;
		this.errors = [];

		this.myProfile = false; // Is this my profile or another user's profile?
		this.user = null;       // The owner of the profile
		this.loc;								// Current locale
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
		$('.accountmenu').removeClass('active');
		this.loc = params.lang;
		this.i18n.setLocale(params.lang);

		if (this.userServices.isAuthenticated() && this.userServices.current === null) {
    	this.userServices.reloadCurrentUser();
    }

		if (this.currentUser && (params.uname == this.currentUser.username)) {
				this.myProfile = true;
				this.user = this.currentUser;
		}
		else {
			let userData = await this.userServices.getUserByUsername(params.uname);
			this.user = new User(userData);
		}

		route.navModel.setTitle(this.user.fullName + " | " + this.project);
		let contributions = await this.userServices.getUserAnnotations(this.user.dbId);
		this.points = contributions.annotationCount;
		this.created = contributions.createdCount;
		this.approved = contributions.approvedCount;
		this.rejected = contributions.rejectedCount;
		this.annotatedRecordsCount = contributions.annotatedRecordsCount;
  }

	// This weird syntax is necessary to be able to access *this*
	uploadImage = () => {
		let input = document.getElementById('imageupload');
		let data = new FormData();
		data.append('file', input.files[0]);

		this.mediaServices.upload(data).then((response) => {
			this.user.avatar = MediaServices.toObject(response);
			// Show the cancel/save buttons
			$('.button-group').removeClass('hiddenfile');
		}).catch((error) => {
			logger.error(error);
			toastr.danger('Error uploading the file!');
		});
	}

	loadFromFile() {
		$('#imageupload').trigger('click');
	}

	deleteAvatar() {
		logger.debug('Delete Avatar');
		this.user.avatar = null;
		// Show the cancel/save buttons
		$('.button-group').removeClass('hiddenfile');
	}

	updateProfile() {
		ValidationRules
			.ensure('firstName').required()
			.ensure('lastName').required()
			.ensure('username').required()
			.ensure('email').required().email()
			.on(this.user);

		this.validationController.validate().then(v => {
			console.log(v);
			if (v.valid) {
				this.userServices.update({
					dbId: this.user.id,
					firstName: this.user.firstName,
					lastName: this.user.lastName,
					about: this.user.about,
					avatar: this.user.avatar
				})
				.then((response) => {
					logger.debug('Profile Updated!');
					location.reload();
				})
				.catch((error) => {
					logger.error(error);
				});
			}
			else {
				this.errors = this.validationController.errors;
			}
		});
	}

	resetChanges() {
		// Reset values
		this.userServices.reloadCurrentUser().then( () => {
			this.user = this.currentUser;
		});
		// Hide the cancel/save buttons
		$('.button-group').addClass('hiddenfile');
	}

}
