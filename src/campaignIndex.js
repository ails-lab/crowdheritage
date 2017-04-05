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

@inject(CampaignServices)
export class CampaignIndex {
  scrollTo(anchor) {
    $('html, body').animate({
      scrollTop: $(anchor).offset().top
    }, 800);
  }

  constructor(campaignServices) {
    this.campaignServices = campaignServices;
    this.campaigns = [];
    this.campaignsCount = 0;
    this.fetchitemnum = 10;
    this.answer = 'initial';
  }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  activate() {
    this.activeCampaigns();
  }

  activeCampaigns() {
    this.campaignServices.getActiveCampaigns( {groupid: '', offset: 0, count: 0} )
      .then( (resultsArray) => {
        this.fillCampaignArray((this.campaigns), resultsArray);
        this.campaignsCount = resultsArray.length;
      });
  }

  fillCampaignArray(campaignArray, results) {
		for (let item of results) {
			campaignArray.push(new Campaign(item));
		}
  }
}
