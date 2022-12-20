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

let logger = LogManager.getLogger('Moderation.js');

@inject(UserServices, Router, NewInstance.of(ValidationController))
export class Moderation {

  constructor(userServices, router) {
    this.userServices = userServices;
    this.router = router;
    this.cname = ''
    this.view = "";
    this.resetClasses();
  }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  activate(params) {
    this.cname = params.cname
    // Check if user is logged in and has elevated access
    if (!this.userServices.isAuthenticated() || !this.userServices.current.isEditor) {
      this.router.navigateToRoute('index', {lang: this.locale});
    }

    this.resetClasses();
    console.log(params)
    this.view = params.resource ? params.resource : 'validation';
    let typeClasses = this.view.split("-")[0] + 'Tab';
    console.log(typeClasses)
    this[typeClasses] = this[typeClasses].concat(" ", "active");
  }

  get locale() { return window.location.href.split('/')[3];  }

  resetClasses() {
    this.validationTab = "nav-item";
    this.statisticsTab = "nav-item";
    this.dataExportTab = "nav-item";
  }

  tabChanged(tab) {
    this.router.navigateToRoute('moderation', {lang: this.locale, cname: this.cname, resource: tab});
  }

}
