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
import { CampaignServices } from 'CampaignServices';
import { Campaign } from "Campaign";
import { Router } from 'aurelia-router';

let logger = LogManager.getLogger('Moderation.js');

@inject(UserServices, CampaignServices, Router, NewInstance.of(ValidationController))
export class Moderation {

  constructor(userServices, campaignServices, router) {
    this.userServices = userServices;
    this.campaignServices = campaignServices;
    this.router = router;
    this.campaign = null;
    this.cname = '';
    this.view = "";
    this.loc = window.location.href.split('/')[3];
    this.resetClasses();
  }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  async activate(params) {
    this.cname = params.cname;

    if (!this.campaign) {
      let campaignData = await this.campaignServices.getCampaignByName(this.cname);
      this.campaign = new Campaign(campaignData, this.loc);
    }

    let isCreator = this.userServices.isAuthenticated() && this.campaign.creators.includes(this.userServices.current.dbId);
    if (!isCreator) {
      let index = this.router.routes.find(x => x.name === 'index');
      this.router.navigateToRoute('index', { lang: 'en' });
    }

    this.resetClasses();
    this.view = params.resource ? params.resource : 'statistics';
    let typeClasses = this.view.split("-")[0] + 'Tab';
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

  returnToCampaign() {
    let summary = this.router.routes.find(x => x.name === 'summary');
    summary.campaign = this.campaign;
    this.router.navigateToRoute('summary', {cname: this.campaign.username, lang: this.loc});
  }
}
