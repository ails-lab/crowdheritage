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

@inject(UserServices, Router)
export class Register {

	constructor(userServices, router) {
		this.userServices = userServices;
    this.router = router;

		// Initialization
		this.email = '';
		this.username = '';
		this.firstName = '';
		this.lastName = '';
		this.password = '';
		this.password2 = '';
		this.gender = '';
		this.usingEmail = true;
		this.genders = [
			{ value: 'male', name: 'Male' },
			{ value: 'female', name: 'Female' },
			{ value: 'unspecified', name: 'Unspecified' }
		];
		this.errors = {};
	}

  activate() {
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
					});
				});
			} else {
				response.json().then((data) => {
					this.errors = data.error;
				});
			}
		}).catch((error) => {
			console.log(error);
		});
	}
}
