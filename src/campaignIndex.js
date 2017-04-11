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
import { Campaign } from './modules/Campaign.js';
import { CampaignServices } from './modules/CampaignServices.js';
import { UserServices } from './modules/UserServices.js';

let COUNT = 1;

@inject(CampaignServices, UserServices)
export class CampaignIndex {
  scrollTo(anchor) {
    $('html, body').animate({
      scrollTop: $(anchor).offset().top
    }, 800);
  }

  constructor(campaignServices, userServices) {
    this.campaignServices = campaignServices;
    this.userServices = userServices;
    this.campaigns = [];
    this.campaignsCount = 0;
    this.currentCount = 0;
    this.loading = false;
    this.more = true;
  }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  activate() {
    this.campaignServices.getCampaignsCount()
      .then( result => {
        this.campaignsCount = result;
      });
    this.activeCampaigns();
  }

  activeCampaigns() {
    this.loading = true;
    this.campaignServices.getActiveCampaigns( {groupid: '', offset: 0, count: COUNT} )
      .then( (resultsArray) => {
        this.fillCampaignArray((this.campaigns), resultsArray);
        this.currentCount = this.currentCount + resultsArray.length;
        if (this.currentCount === this.campaignsCount) {
          this.more = false;
        }
      });
    this.loading = false;
  }

  fillCampaignArray(campaignArray, results) {
		for (let item of results) {
			campaignArray.push(new Campaign(item));
		}
  }

  loadMore() {
    this.loading = true;
    this.campaignServices.getActiveCampaigns( {groupid: '', offset: this.currentCount, count: COUNT} )
      .then( (resultsArray) => {
        this.fillCampaignArray((this.campaigns), resultsArray);
        this.currentCount = this.currentCount + resultsArray.length;
        if (this.currentCount === this.campaignsCount) {
          this.more = false;
        }
      });
    this.loading = false;
  }

}
