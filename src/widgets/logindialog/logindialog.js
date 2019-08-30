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


import { inject, LogManager } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';
import { UserServices } from 'UserServices.js';
import { Router } from 'aurelia-router';

let logger = LogManager.getLogger('logindialog.js');

@inject(DialogController, UserServices, Router)
export class LoginDialog {

	constructor(controller, userServices, router) {
		this.controller = controller;
		this.userServices = userServices;
		this.router = router;
	}

	// Interface functions
	scrollEmail() {
		$('.externalLogin').slideUp();
		$('.emailLogin').slideDown();
	}

	scrollDownEmail() {
		$('.emailLogin').slideUp();
		$('.externalLogin').slideDown();
	}

	// Functionality
	signin() {
		this.userServices.login({
			email: this.email,
			password: this.password
		}, {}, 0).then((response) => {	// Do not redirect
			this.controller.ok();
			location.reload();
		}).catch((error) => {
			this.error = error;
			logger.error(error);
		});
	}

	authenticate(provider) {
		this.userServices.authenticate(provider, '#/' + this.router.currentInstruction.fragment)
			.then((response) => {
				this.controller.ok();
			})
			.catch((error) => {
				logger.error(error);
			});
	}

	register() {
		this.controller.cancel();
		this.router.navigateToRoute('register');
	}

	attached() {
    $('.accountmenu').removeClass('active');
  }

}
