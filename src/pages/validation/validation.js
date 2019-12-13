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
import settings from 'global.config.js';

let instance = null;

@inject(CampaignServices, RecordServices, UserServices, Router, I18N)
export class Validation {

  constructor(campaignServices, recordServices, userServices, router, i18n) {
  	if (instance) {
  		return instance;
  	}
    this.colorSet = [
			["Black",       "background-color: #111111", "color: #111111; filter: brightness(500%);"],
			["Grey",        "background-color: #AAAAAA","color: #AAAAAA; filter: brightness(60%);"],
			["Brown",       "background-color: brown", "color:brown; filter: brightness(60%);"],
			["Red",         "background-color: #FF4136","color: #FF4136; filter: brightness(60%);"],
			["Orange",      "background-color: #FF851B", "color: #FF851B; filter: brightness(60%);"],
			["Beige",       "background-color: beige", "color: beige; filter: brightness(60%);"],
			["Yellow",      "background-color: #FFDC00", "color: #FFDC00; filter: brightness(60%);"],
			["Green",       "background-color: #2ECC40", "color: #2ECC40; filter: brightness(60%);"],
			["Blue",        "background-color: #0074D9", "color: #0074D9; filter: brightness(60%);"],
			["Purple",      "background-color: #B10DC9", "color: #B10DC9; filter: brightness(60%);"],
			["Pink",        "background-color: pink", "color: pink; filter: brightness(60%);"],
			["White",       "background-color: #FFFFFF", "color: #FFFFFF; filter: brightness(60%);"],
			["Copper",      "background-image: url(/img/color/copper.jpg)", "color: #b87333; filter: brightness(50%);"],
			["Silver",      "background-image: url(/img/color/silver.jpg)", "color:  #DDDDDD; filter: brightness(30%);"],
			["Bronze",      "background-image: url(/img/color/bronze.jpg)", "color: #cd7f32; filter: brightness(50%);" ],
			["Gold",        "background-image: url(/img/color/gold.jpg)", "color: #FFD700; filter: brightness(50%);"],
			["Multicolor",  "background-image: linear-gradient(to right, red,orange,yellow,green,blue,indigo,violet)", " color: white; text-shadow: 1px 1px 2px #424242;"],
			["Transparent", "", "color: white; text-shadow: 1px 1px 2px #424242;"]
		];
  	this.campaignServices = campaignServices;
    this.recordServices = recordServices;
  	this.userServices = userServices;
  	this.router = router;
  	this.i18n = i18n;

  	this.loc;
    this.project = settings.project;

    this.campaignItem = null;
    this.records = [];
    this.label = "";
    this.generators = [];
    this.loadCamp = false;
    this.loadRec = false;
    this.loading = false;
  	if (!instance) {
  		instance = this;
  	}
  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }
  get user()            { return this.userServices.current; }

  hasMotivation(name) {
    return !!this.campaign.motivation.includes(name);
  }

  getColorLabel(label) {
    return this.i18n.tr('item:color:'+label);
  }

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


	}

  selectLabel(label) {
    this.label = label.toLowerCase();
    this.generators.splice(0, this.generators.length);
    this.generators.push(this.project + " " + this.campaign.username);
    if (this.campaign.username == "colours-catwalk") {
      this.generators.push("Image Analysis");
    }
    console.log(this.label, this.generators);
    this.recordServices.getAnnotatedRecordsByLabel(this.label, this.generators)
      .then( response => {
        this.records = response;
        console.log(this.records);
        this.loading = true;
      });
  }

}
