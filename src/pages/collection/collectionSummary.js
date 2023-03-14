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
import { Collection } from 'Collection.js';
import { CollectionServices } from 'CollectionServices.js';
import { UserServices } from 'UserServices';
import { I18N } from 'aurelia-i18n';
//import settings from 'global.config.js';

let instance = null;

@inject(CampaignServices, CollectionServices, UserServices, Router, I18N)
export class CollectionSummary {

  constructor(campaignServices, collectionServices, userServices, router, i18n) {
		if (instance) {
			return instance;
		}
    this.campaignServices = campaignServices;
	  this.collectionServices = collectionServices;
	  this.userServices = userServices;
	  this.router = router;
    this.i18n = i18n;

    this.loc;
    this.campaign = null;
	  if (!instance) {
			instance = this;
		}
  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }
	get user() { return this.userServices.current; }

  attached() {
	  $('.accountmenu').removeClass('active');
	}

	async activate(params, route) {
    this.loc = params.lang;
		this.i18n.setLocale(params.lang);
		this.cname = params.cname;
    if (route.campaignData) {
      // Shallow copy the campaign data
      this.campaign = Object.assign({}, route.campaignData);
      // Clean up campaignData to avoid having stale route data
      route.campaignData = null;
    }
    else {
      let campaignRawData = await this.campaignServices.getCampaignByName(params.cname);
      this.campaign = new Campaign(campaignRawData, this.loc);
    }
		this.collectionId = params.colid;
		let collectionData = await this.collectionServices.getCollection(this.collectionId);
		this.collection = new Collection(collectionData);
    let title = this.collection.title[this.loc] && this.collection.title[this.loc][0] !== 0 ? this.collection.title[this.loc][0] : this.collection.title.default[0];
    route.navModel.setTitle('Collection | ' + title);
	}

}
