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
import { UserServices } from 'UserServices.js';
import { I18N } from 'aurelia-i18n';

@inject(UserServices, I18N)
export class Privacy {

  constructor(userServices, i18n) {
    this.userServices = userServices;
    this.i18n = i18n;

		this.loc;
  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }

  activate(params) {
    this.loc = params.lang;
		this.i18n.setLocale(params.lang);

    if (this.userServices.isAuthenticated() && this.userServices.current === null) {
      this.userServices.reloadCurrentUser();
    }
  }

}
