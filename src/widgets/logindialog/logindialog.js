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
import { I18N } from 'aurelia-i18n';

let logger = LogManager.getLogger('logindialog.js');

@inject(DialogController, UserServices, Router, I18N)
export class LoginDialog {

	constructor(controller, userServices, router, i18n) {
		this.controller = controller;
		this.userServices = userServices;
		this.router = router;
		this.i18n = i18n;
	}

	get currentLocale() { return window.location.href.split('/')[3]; }

	// Interface functions
	scrollEmail() {
		$('.externalLogin').slideUp();
		$('.emailLogin').slideDown();
	}

	scrollDownEmail() {
		$('.emailLogin').slideUp();
		$('.externalLogin').slideDown();
	}

  showForgetPasswordDialog(){
    $('.forgetPasswordDialog').slideDown();
    $('.emailLogin').slideUp();
		$('#dialogHeader').text(this.i18n.tr('app:login-reset-password'));
  }

  cancelForgetPassword(){
    $('.emailLogin').slideDown();
    $('.forgetPasswordDialog').slideUp();
		this.emailForget = '';
		$('#dialogHeader').text(this.i18n.tr('app:login-header'));
  }

	// Functionality
	signin() {
		this.userServices.login({
			email: this.email,
			password: this.password
		}, {}, 0).then((response) => {	// Do not redirect
			if (response === "Invalid email/username or password") {
				this.password = "";
				toastr.error("Invalid email/username or password");
			}
			else {
				// location.reload();
				this.controller.ok();
			}
		}).catch((error) => {z
			this.error = error;
			logger.error(error);
		});
	}

  forgetPasswordSubmit(){
    this.userServices.resetPassword(this.emailForget).then(response => {
      toastr.success("A link to reset your password was sent to your email");
			this.controller.ok();
    }).catch( error => {
      toastr.error("This email/username does not exist");
      logger.error(error);
    })
  }

	authenticate(provider) {
		this.userServices.authenticate(provider, this.router.currentInstruction.fragment)
			.then((response) => {
				location.reload();
				this.controller.ok();
			})
			.catch((error) => {
				logger.error(error);
			});
	}

	register() {
		this.controller.cancel();
		let loc = window.location.href.split('/')[3];
		this.router.navigate(loc+'/register');
	}

	attached() {
    $('.accountmenu').removeClass('active');
  }

}
