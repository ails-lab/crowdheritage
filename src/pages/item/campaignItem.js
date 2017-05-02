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
import { Router, activationStrategy } from 'aurelia-router';
import { Record } from '../../modules/Record.js';
import { Campaign } from '../../modules/Campaign.js';
import { Collection } from '../../modules/Collection.js';
import { RecordServices } from '../../modules/RecordServices.js';
import { CampaignServices } from '../../modules/CampaignServices.js';
import { CollectionServices } from '../../modules/CollectionServices.js';

let COUNT = 5;

@inject(RecordServices, CampaignServices, CollectionServices, Router)
export class CampaignItem {

  constructor(recordServices, campaignServices, collectionServices, router) {
    this.campaignServices = campaignServices;
    this.collectionServices = collectionServices;
    this.recordServices = recordServices;
    this.router = router;
    this.campaign = 0;
    this.collection = 0;
    this.collectionCount = 0;
    this.currentCount = "";
    this.loadCamp = false;
    this.loadRec = false;
    this.more = true;
    this.hasCollection = false;
    this.record = 0;
    this.records = [];
    this.offset = 0;
  }

  nextItem(camp, col, records, offset) {
    if (offset < this.collectionCount) {
      let item = this.router.routes.find(x => x.name === 'item');
      item.campaign = camp;
      item.collection = col;
      item.records = records;
      item.offset = offset;
      if (records.length > 0) {
        this.router.navigateToRoute('item', {cname: camp.username, gname: camp.spacename, recid: item.records[0].dbId});
      }
      else {
        this.router.navigateToRoute('item', {cname: camp.username, gname: camp.spacename, recid: "42"});
      }
    }

    // If the collection ran out of records, go back to campaign summary page
    else {
      let summary = this.router.routes.find(x => x.name === 'summary');
      summary.campaign = camp;
      this.router.navigateToRoute('summary', {cname: camp.username, gname: camp.spacename});
    }
  }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  activate(params, routeData) {
    this.loadCamp = true;
    if ( routeData.campaign ) {
      this.campaign = routeData.campaign;
      this.loadCamp = false;
      if ( routeData.collection ) {
        this.collection = routeData.collection;
        this.collectionCount = this.collection.entryCount;
        this.hasCollection = true;
        // If the current record-batch still has items
        // get the next record from the batch
        if ( routeData.records.length > 0 ) {
          this.loadRec = true;
          this.offset = routeData.offset;
          this.records = routeData.records;
          this.record = this.records.shift();
          this.currentCount = routeData.offset + 1;
          this.loadRec = false;
        }
        // If the current record-batch ran out of items
        // make a call and get the next batch of records
        else {
          this.loadRec = true;
          this.offset = routeData.offset;
          this.collectionServices.getRecords(this.collection.dbId, this.offset, COUNT)
            .then(response => {
  						if (response.records.length>0) {
                for (let i in response.records) {
                  let result = response.records[i];
                  if (result !== null) {
                    let record = new Record(result);
                    this.records.push(record);
                  }
                }
                this.record = this.records.shift();
                this.currentCount = routeData.offset + 1;
                this.loadRec = false;
              }
  					}).catch(error => {
  						console.log(error.message);
  					});
        }
      }
    }

    else {
      this.loadRec = true;
      this.recordServices.getRecord(params.recid)
  			.then(data => {
  				this.record = new Record(data);
  				this.loadRec = false;
  			}).catch(error => {
  				// If the recordId is wrong, redirect to campaign summary page
          this.router.navigateToRoute('summary', {cname: params.cname, gname: params.gname});
  			});

      this.campaignServices.getCampaignByName(params.cname)
        .then( (result) => {
          this.campaign = new Campaign(result);
          this.loadCamp = false;
      });
    }
  }

  hasMotivation(name) {
    return !!this.campaign.motivation.includes(name);
  }
}
