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
import { Campaign } from 'Campaign.js';
import { CampaignServices } from 'CampaignServices.js';
import { Record } from 'Record.js';
import { RecordServices } from 'RecordServices.js';
import { UserServices } from 'UserServices';
import { I18N } from 'aurelia-i18n';
//import settings from 'global.config.js';

let instance = null;

@inject(CampaignServices, RecordServices, UserServices, Router, I18N)
export class Validation {

  constructor(campaignServices, recordServices, userServices, router, i18n) {
	if (instance) {
		return instance;
	}
	this.campaignServices = campaignServices;
  this.recordServices = recordServices;
	this.userServices = userServices;
	this.router = router;
	this.i18n = i18n;

	this.loc;
  this.campaignItem = null;
  this.records = [];
  this.label = "";
  this.generators = [];
  this.loadCamp = false;
  this.loadRec = false;
	if (!instance) {
		instance = this;
	}
  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }
  get user()            { return this.userServices.current; }

  attached() {
    $('.accountmenu').removeClass('active');
  }

	async activate(params, route) {
    this.loc = params.lang;
		this.i18n.setLocale(params.lang);

		this.cname = params.cname;
    let result = await this.campaignServices.getCampaignByName(params.cname)
      .then(response => {
        // Based on the selected language, set the campaign {title, description, instructions, prizes}
        response.title = ( response.title[this.loc] ? response.title[this.loc] : response.title['en'] );
        response.description = ( response.description[this.loc] ? response.description[this.loc] : response.description['en'] );
        response.instructions = ( response.instructions[this.loc] ? response.instructions[this.loc] : response.instructions['en'] );
        response.prizes.gold = ( response.prizes.gold[this.loc] ? response.prizes.gold[this.loc] : response.prizes.gold['en'] );
        response.prizes.silver = ( response.prizes.silver[this.loc] ? response.prizes.silver[this.loc] : response.prizes.silver['en'] );
        response.prizes.bronze = ( response.prizes.bronze[this.loc] ? response.prizes.bronze[this.loc] : response.prizes.bronze['en'] );
        response.prizes.rookie = ( response.prizes.rookie[this.loc] ? response.prizes.rookie[this.loc] : response.prizes.rookie['en'] );

        this.campaign = new Campaign(response);
      })
      .catch(error => {
        let index = this.router.routes.find(x => x.name === 'index');
        this.router.navigateToRoute('index', {lang: 'en'});
      });
    this.loadCamp = false;

    route.navModel.setTitle('Validation | ' + this.campaign.title);

    this.label = "red";
    this.generators = ["Image Analysis", "CrowdHeritage colours-catwalk"];
    this.recordServices.getAnnotatedRecordsByLabel(this.label, this.generators)
      .then( response => {
        this.records = response;
        console.log(this.records);
      });
	}

}
