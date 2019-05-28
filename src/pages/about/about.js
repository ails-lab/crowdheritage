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
//import { SpaceServices } from '../../modules/SpaceServices.js';

@inject(UserServices, Element, I18N)//, SpaceServices)
export class About {

	constructor(userServices, element, i18n) {
		this.userServices = userServices;
		this.element = element;
		this.i18n = i18n;
		//this.spaceServices = spaceServices;

		this.loc;
		this.isWith = true;
	}

	get isAuthenticated() { return this.userServices.isAuthenticated(); }
	//get space() { return this.spaceServices.active; }

	scrollTo(anchor) {
		$('html, body').animate({
			scrollTop: $(anchor).offset().top
		}, 1000);
	}

	activate(params) {
		this.loc = params.lang;
		this.i18n.setLocale(params.lang);

    if (this.userServices.isAuthenticated() && this.userServices.current === null) {
      this.userServices.reloadCurrentUser();
    }

		this.isWith = typeof(params.name) === 'undefined';
		// TODO: Check for changed space
	}
}
