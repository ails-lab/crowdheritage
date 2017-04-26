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
import { Record } from '../../modules/Record.js';
import { Campaign } from '../../modules/Campaign.js';
import { Collection } from '../../modules/Collection.js';
import { RecordServices } from '../../modules/RecordServices.js';
import { CampaignServices } from '../../modules/CampaignServices.js';
import { CollectionServices } from '../../modules/CollectionServices.js';

@inject(RecordServices, CampaignServices, CollectionServices)
export class CampaignItem {

  constructor(recordServices, campaignServices, collectionServices) {
    this.campaignServices = campaignServices;
    this.collectionServices = collectionServices;
    this.recordServices = recordServices;
    this.campaign = 0;
    this.collection = 0;
    this.collectionCount = 0;
    this.currentCount = 0;
    this.loading = false;
    this.more = true;
    this.hasCollection = false;
    this.record = new Record();
  }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  activate(params, routeData) {
    this.loading = true;
    if ( routeData.campaign ) {
      this.campaign = routeData.campaign;
      this.loading = false;
    }
    else {
      this.campaignServices.getCampaignByName(params.cname)
        .then( (result) => {
          this.campaign = new Campaign(result);
          this.loading = false;
      });
    }
    if ( routeData.collection ) {
      this.collection = routeData.collection;
      this.hasCollection = true;
    }
  }

  hasMotivation(name) {
    return !!this.campaign.motivation.includes(name);
  }

  loadRecord() {
		this.loading = true;
		this.recordServices.getRecord(this.id)
			.then(data => {
				this.record = new Record(data);
				this.loading = false;
			}).catch(error => {
				this.loading = false;
				console.log(error.message);
				toastr.error("Error loading record:"+error.message);
			});
	}
}
