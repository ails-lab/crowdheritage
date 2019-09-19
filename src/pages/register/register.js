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
import { I18N } from 'aurelia-i18n';
import { DialogController } from 'aurelia-dialog';

@inject(DialogController, UserServices, Router, I18N)
export class Register {

	constructor(controller, userServices, router, i18n) {
		this.controller = controller;
		this.userServices = userServices;
    this.router = router;
		this.i18n = i18n;
		this.loc;

		// Initialization
		this.email = '';
		this.username = '';
		this.firstName = '';
		this.lastName = '';
		this.password = '';
		this.password2 = '';
		this.gender = '';
		this.usingEmail = true;
		this.acceptTerms = false;
		this.genders = [
			{ value: 'male',        name: this.i18n.tr('register:male') },
			{ value: 'female',      name: this.i18n.tr('register:female') },
			{ value: 'unspecified', name: this.i18n.tr('register:unspecified') }
		];
		this.errors = {};
	}

	get canRegister() {
		return this.acceptTerms;
	}

  activate(params) {
		this.loc = params.lang;
		this.i18n.setLocale(params.lang);

    if (this.userServices.isAuthenticated()) {
      this.router.navigateToRoute('index');
    }
  }

	register() {
		this.userServices.register({
			email: this.email,
			username: this.username,
			firstName: this.firstName,
			lastName: this.lastName,
			password: this.password,
			gender: this.gender
		}).then((response) => {
			if (response.ok) {
				response.json().then((data) => {
					this.errors = {};
					this.userServices.login({	// A login is required to set all the variables right
						email: this.email,
						password: this.password
					}, {}, 0).then((response) => {
						this.controller.ok();
						this.router.navigateToRoute('index');
					}).catch((error) => {
						this.error = error;
						logger.error(error);
					});
					this.router.navigateToRoute('index');
				});
			} else {
				response.json().then((data) => {
					this.errors = data.error;

					toastr.error(Object.values(this.errors).map(function(e) {return e + '<br>'}));
				});
			}
		}).catch((error) => {
			console.log(error);
		});
	}
}
