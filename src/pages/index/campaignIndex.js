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
import { Campaign } from '../../modules/Campaign.js';
import { CampaignServices } from '../../modules/CampaignServices.js';
import { UserServices } from '../../modules/UserServices.js';
import { Record } from '../../modules/Record.js';
import { RecordServices } from '../../modules/RecordServices.js';
import { Router } from 'aurelia-router';

let COUNT = 2;

@inject(CampaignServices, UserServices, RecordServices, Router)
export class CampaignIndex {
  scrollTo(anchor) {
    $('html, body').animate({
      scrollTop: $(anchor).offset().top
    }, 800);
  }

  constructor(campaignServices, userServices, recordServices, router) {
    this.campaignServices = campaignServices;
    this.userServices = userServices;
    this.recordServices = recordServices;
    this.router = router;

    this.campaigns = [];
    this.campaignsCount = 0;
    this.currentCount = 0;
    this.loading = false;
    this.more = true;
    this.groupName = "";
  }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  activate(params) {
    if (this.userServices.isAuthenticated() && this.userServices.current === null) {
      this.userServices.reloadCurrentUser();
    }

    this.groupName = params.gname;
    if (!params.gname) {
      this.campaignServices.getCampaignsCount("")
        .then( result => {
          this.campaignsCount = result;
        });
      this.activeCampaigns("");
    }
    else {
      this.campaignServices.getCampaignsCount(params.gname)
        .then( result => {
          this.campaignsCount = result;
          // If no campaigns found on this space, redirect to showing all campaigns
          if (result == 0) {
            this.router.navigateToRoute('index');
          }
        });
      this.activeCampaigns(params.gname);
    }
  }

  activeCampaigns(groupName) {
    this.loading = true;
    this.campaignServices.getActiveCampaigns( {group: groupName, offset: 0, count: COUNT} )
      .then( (resultsArray) => {
        this.fillCampaignArray((this.campaigns), resultsArray);
        this.currentCount = this.currentCount + resultsArray.length;
        if (this.currentCount >= this.campaignsCount) {
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
    this.campaignServices.getActiveCampaigns( {group: this.groupName, offset: this.currentCount, count: COUNT} )
      .then( (resultsArray) => {
        this.fillCampaignArray((this.campaigns), resultsArray);
        this.currentCount = this.currentCount + resultsArray.length;
        if (this.currentCount === this.campaignsCount) {
          this.more = false;
        }
      });
    this.loading = false;
  }

  goToRandomItem(camp, col, records, offset) {
    let item = this.router.routes.find(x => x.name === 'item');
    let recs = [];
    item.campaign = camp;
    item.collection = 0;
    item.offset = offset;

    // Get 2 random records to start annotating
    this.loading = true;
    this.recordServices.getRandomRecordsFromCollections(camp.targetCollections, 2)
      .then(response => {
        if (response.length>0) {
          for (let i in response) {
            let result = response[i];
            if (result !== null) {
              let record = new Record(result);
              recs.push(record);
            }
          }
          this.loading = false;
          item.records = recs;
          this.router.navigateToRoute('item', {cname: camp.username, gname: camp.spacename, recid: recs[0].dbId});
        }
        })
      .catch(error => {
        this.loading = false;
        console.log(error.message);
      });
  }

}
