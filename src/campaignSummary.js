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
import { Collection } from './modules/Collection.js';
import { CollectionServices } from './modules/CollectionServices.js';

let COUNT = 1;

@inject(CampaignServices, CollectionServices)
export class CampaignSummary {
  scrollTo(anchor) {
    $('html, body').animate({
      scrollTop: $(anchor).offset().top
    }, 1000);
  }

  constructor(campaignServices, collectionServices) {
    this.campaignServices = campaignServices;
    this.collectionServices = collectionServices;
    this.campaign = 0;
    this.collections = [];
    this.collectionsCount = 0;
    this.currentCount = 0;
    this.loading = false;
    this.more = true;
  }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  activate(params, routeData) {
    if ( routeData.campaign ) {
      this.campaign = routeData.campaign;
      this.collectionsCount = this.campaign.targetCollections.length;
      this.getCampaignCollections(this.campaign.targetCollections, 0, COUNT);
    }
    else {
      this.campaignServices.getCampaign(params.id)
        .then( (result) => {
          this.campaign = new Campaign(result);
          this.collectionsCount = this.campaign.targetCollections.length;
          this.getCampaignCollections(this.campaign.targetCollections, 0, COUNT);
      });
    }
  }

  getCollections(data, offset) {
    let cols = [];
    for (let i in data) {
      cols.push(new Collection(data[i]));
    }
    return cols;
  }

  getCampaignCollections(colIds, offset, count) {
    this.loading = true;
    this.collectionServices.getMultipleCollections(colIds, offset, count)
      .then( response => {
        this.currentCount = this.currentCount + count;
        if (this.currentCount >= this.collectionsCount) {
          this.more = false;
        }
        this.collections = this.collections.concat(this.getCollections(response, 10));
      });
    this.loading = false;
  }

  loadMore() {
    this.getCampaignCollections(this.campaign.targetCollections, this.currentCount, COUNT);
  }

}
