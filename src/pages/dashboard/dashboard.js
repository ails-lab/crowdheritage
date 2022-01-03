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
import { Router } from 'aurelia-router';

let logger = LogManager.getLogger('Dashboard.js');

@inject(UserServices, Router, NewInstance.of(ValidationController))
export class Dashboard {

  constructor(userServices, router) {
    this.userServices = userServices;
    this.router = router;

    this.view = "";
    this.campaignsTab = "nav-item";
    this.collectionsTab = "nav-item";
    this.userGroupsTab = "nav-item";
  }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  activate(params) {
    // Check if user is logged in and has elevated access
    if (!this.userServices.isAuthenticated()) {
      this.router.navigateToRoute('index', {lang: this.locale});
    }

    this.resetClasses();
    this.view = params.resource ? params.resource : 'campaigns';
    let typeClasses = this.view.split("-")[0] + 'Tab';
    this[typeClasses] = this[typeClasses].concat(" ", "active");
  }

  get locale() { return window.location.href.split('/')[3];  }

  resetClasses() {
    this.campaignsTab = "nav-item";
    this.collectionsTab = "nav-item";
    this.userGroupsTab = "nav-item";
  }

  tabChanged(tab) {
    // this.view = tab;
    // this.resetClasses();
    // let typeClasses = this.view + 'Tab';
    // this[typeClasses] = this[typeClasses].concat(" ", "active");
    this.router.navigateToRoute('dashboard', {lang: this.locale, resource: tab});
  }

}
