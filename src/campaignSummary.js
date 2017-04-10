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
import { Collection } from './modules/Collection.js';
import { CampaignServices } from './modules/CampaignServices.js';
import { CollectionServices } from './modules/CollectionServices.js';

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
  }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  activate(params, routeData) {
    let camp=0;
    let cols=[];

    if ( routeData.campaign ) {
      camp = routeData.campaign;
    }
    else {
      this.campaignServices.getCampaign(params.id)
        .then( (result) => {
          camp = new Campaign(result);
      });
    }

    alert(camp.targetCollections);
    this.collectionServices.getMultipleCollections(camp.targetCollections)
      .then( response => {
        cols = this.getCollections(response, 10);
      });

    this.campaign = camp;
    this.collections = cols;
  }

  getCollections(data, offset) {
    let cols = [];
    for (let item in data) {
      cols.push(new Collection(item));
    }
    return cols;
  }
}
