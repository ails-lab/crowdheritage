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
import { UserServices } from '../../modules/UserServices';
import { RecordServices } from '../../modules/RecordServices.js';
import { CampaignServices } from '../../modules/CampaignServices.js';
import { CollectionServices } from '../../modules/CollectionServices.js';

let COUNT = 10;

@inject(UserServices, RecordServices, CampaignServices, CollectionServices, Router)
export class CampaignItem {

  constructor(userServices, recordServices, campaignServices, collectionServices, router) {
    this.campaignServices = campaignServices;
    this.collectionServices = collectionServices;
    this.recordServices = recordServices;
    this.userServices = userServices;
    this.router = router;

    this.campaign = 0;
    this.collection = 0;
    this.collectionTitle = "";
    this.collectionCount = 0;
    this.currentCount = "";

    this.loadCamp = false;
    this.loadRec = false;
    this.more = true;
    this.hasCollection = false;

    this.record = 0;
    this.records = [];
    this.offset = 0;

    this.mediaDiv = '';
  }

  nextItem(camp, col, records, offset) {
    // clear previous media
    this.mediaDiv = '';

    // Random record retrieval
    if (col == 0) {
      let item = this.router.routes.find(x => x.name === 'item');
      item.campaign = camp;
      item.records = records;
      this.router.navigateToRoute('item', {cname: camp.username, gname: camp.spacename, recid: item.records[0].dbId});
    }

    // Record retrieval from specific collection
    else {
      // Collection has remaining records
      if (offset < this.collectionCount) {
        let item = this.router.routes.find(x => x.name === 'item');
        item.campaign = camp;
        item.collection = col;
        item.records = records;
        item.offset = offset;
        this.router.navigateToRoute('item', {cname: camp.username, gname: camp.spacename, recid: item.records[0].dbId});
      }
      // If the collection ran out of records, go back to campaign summary page
      else {
        let summary = this.router.routes.find(x => x.name === 'summary');
        summary.campaign = camp;
        this.router.navigateToRoute('summary', {cname: camp.username, gname: camp.spacename});
      }
    }
  }

  randomRecords() {
    this.loadRec = true;
    this.recordServices.getRandomRecordsFromCollections(this.campaign.targetCollections, COUNT+1)
      .then(response => {
        if (response.length>0) {
          for (let i in response) {
            let result = response[i];
            if (result !== null) {
              let record = new Record(result);
              this.records.push(record);
            }
          }
          this.showMedia();
          this.loadRec = false;
        }
        })
      .catch(error => {
        this.loadRec = false;
        console.log(error.message);
      });
  }

  loadRecordFromBatch(routeData) {
    this.loadRec = true;
    this.offset = routeData.offset;
    this.records = routeData.records;
    this.record = this.records.shift();
    this.currentCount = routeData.offset + 1;
    this.loadRec = false;
    this.showMedia();
  }

  fetchRecordBatch(routeData) {
    this.loadRec = true;
    this.offset = routeData.offset;
    this.collectionServices.getRecords(this.collection.dbId, this.offset, COUNT+1)
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
          this.showMedia();
        }
      }).catch(error => {
        this.loadRec = false;
        console.log(error.message);
      });
  }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  activate(params, routeData) {
    if (this.userServices.isAuthenticated() && this.userServices.current === null) {
      this.userServices.reloadCurrentUser();
    }

    this.loadCamp = true;
    if ( routeData.campaign ) {
      this.campaign = routeData.campaign;
      this.loadCamp = false;
      // Record retrieval from collection
      if ( routeData.collection ) {
        this.collection = routeData.collection;
        this.collectionTitle = this.collection.title;
        this.collectionCount = this.collection.entryCount;
        this.hasCollection = true;
        // If the current record-batch still has items
        // get the next record from the batch
        if ( routeData.records.length > 1 ) {
          this.loadRecordFromBatch(routeData);
        }
        // If the current record-batch ran out of items
        // make a call and get the next batch of records
        else {
          this.fetchRecordBatch(routeData);
        }
      }
      // Random record retrieval
      else {
        if ( routeData.records.length > 1 ) {
          this.loadRecordFromBatch(routeData);
        }
        else {
          this.record = routeData.records[0];
          this.randomRecords();
        }
      }
    }

    else {
      this.loadRec = true;
      this.recordServices.getRecord(params.recid)
  			.then(data => {
  				this.record = new Record(data);
  				this.loadRec = false;
          this.randomRecords();
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

  showMedia() {
    if (this.record.source_uri && !this.checkURL(this.record.source_uri) && this.record.source_uri.indexOf('archives_items_') > -1) {
    	var id = this.record.source_uri.split("_")[2];
      this.mediaDiv = '<div><iframe id="mediaplayer" src="http://archives.crem-cnrs.fr/archives/items/'+id+'/player/346x130/" height="250px" scrolling="no" width="361px"></iframe></div>';
    }
    else if (this.record.mediatype=="WEBPAGE") {
      this.mediaDiv = '<div><iframe id="mediaplayer" src="'+this.record.fullresImage+'" width="100%" height="600px"></iframe></div>';
    }
    else {
    	if(this.record.mediatype=="VIDEO" && !this.checkURL(this.record.fullresImage)) {
        this.mediaDiv = '<video id="mediaplayer" controls width="576" height="324"><source src="' + this.record.fullresImage + '">Your browser does not support HTML5</video>';
    	}
    	else if(this.record.mediatype=="AUDIO"  && !this.checkURL(this.record.fullresImage)) {
    		if(this.record.thumbnail) {
          this.mediaDiv = '<div><img src="'+this.record.thumbnail+'" style="max-width:50%;"/></br></br></div><div><audio id="mediaplayer" controls width="576" height="324"><source src="' + this.record.fullresImage + '">Your browser does not support HTML5</audio></div>';
        }
        else {
          this.mediaDiv = '<div><img src="/img/assets/img/ui/ic-noimage.png" style="max-width:50%;"/></br></br></div><div><audio id="mediaplayer" controls width="576" height="324"><source src="' + this.record.fullresImage + '">Your browser does not support HTML5</audio>';
        }
      }
    }
  }

  checkURL(url) {
		if (url) {
      return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }
		return false;
	}

}
