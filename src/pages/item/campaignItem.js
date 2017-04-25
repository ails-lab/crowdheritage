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
import { Collection } from '../../modules/Collection.js';
import { CollectionServices } from '../../modules/CollectionServices.js';

@inject(CampaignServices, CollectionServices)
export class CampaignItem {

  constructor(campaignServices, collectionServices) {
    this.campaignServices = campaignServices;
    this.collectionServices = collectionServices;
    this.campaign = 0;
    this.collection = 0;
    this.collectionCount = 0;
    this.currentCount = 0;
    this.loading = false;
    this.more = true;
    this.hasCollection = false;
  }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  activate(params, routeData) {
    if ( routeData.campaign ) {
      this.campaign = routeData.campaign;
    }
    else {
      this.campaignServices.getCampaignByName(params.cname)
        .then( (result) => {
          this.campaign = new Campaign(result);
      });
    }
    if ( routeData.collection ) {
      this.collection = routeData.collection;
      this.hasCollection = true;
    }
  }
}
