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
import { UserServices } from '../../modules/UserServices.js';
//import { SpaceServices } from '../../modules/SpaceServices.js';

@inject(UserServices, Element)//, SpaceServices)
export class About {

	constructor(userServices, element, spaceServices) {
		this.userServices = userServices;
		this.element = element;
		//this.spaceServices = spaceServices;
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
    if (this.userServices.isAuthenticated() && this.userServices.current === null) {
      this.userServices.reloadCurrentUser();
    }

		this.isWith = typeof(params.name) === 'undefined';
		// TODO: Check for changed space
	}
}
