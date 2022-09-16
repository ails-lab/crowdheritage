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
    this.password = '';
    this.passwordRep = '';
  }

  activate(params) {
    this.token = params.token;
    this.loc = params.lang;
    this.i18n.setLocale(params.lang);

    if (this.userServices.isAuthenticated()) {
      this.router.navigateToRoute('index');
    }
  }

  checkValidity() {
    return this.password == this.passwordRep;
  }

  submit() {
    if (!this.checkValidity()) {
      toastr.error("Password and Repeat Password must match");
      return;
    }
    this.userServices.changePassword({
      token: this.token,
      password: this.password
    }).then(response => {
      if (response.ok) {

        toastr.success("Password changed successfully.</br> You can now sign in with your new credentials.")
        this.router.navigateToRoute('index', { lang: this.loc });
      }
      else{
				response.json().then((data) => {
					toastr.error(data.error);
      })
    }
    }).catch(error => {
        toastr.error(error);
      })
  }

}
