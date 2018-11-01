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
import { Record } from 'Record.js';
import { Campaign } from 'Campaign.js';
import { Collection } from 'Collection.js';
import { UserServices } from 'UserServices';
import { RecordServices } from 'RecordServices.js';
import { CampaignServices } from 'CampaignServices.js';
import { CollectionServices } from 'CollectionServices.js';
import { toggleMore } from 'utils/Plugin.js';

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
		this.hasCollection = false;
		//If there is a collection
    this.collection = 0;
    this.collectionTitle = '';
    this.collectionCount = 0;
    // this.currentCount = "";
		//All the collection items have been retrieved
		this.allItemsInBuffer = false;
		this.offset = 0;

		this.record = 0;
		this.records = [];

    this.loadCamp = false;
    this.loadRec = false;
    // this.more = true;

    this.mediaDiv = '';
  }

  nextItem() {
    // clear previous media
    this.mediaDiv = '';

	  let item = this.router.routes.find(x => x.name === 'item');
	  item.campaign = this.campaign;
		item.collection = this.collection;
	  item.records = this.records;
	  this.router.navigateToRoute('item', {cname: this.campaign.username, gname: this.campaign.spacename, recid: this.records[this.offset].dbId});
  }

	toggleLoadMore(container) {
		toggleMore(container);
	}

	getNextCollectionRecords(count) {
		alert(this.records);
		this.collectionServices.getRecords(this.collection.dbId, this.offset, count)
			.then(response => {
				if (response.records.length > 0) {
					for (let i in response.records) {
						let result = response.records[i];
						if (result !== null) {
							let record = new Record(result);
							this.records.push(record);
						}
					}
					if (response.records.length < count)
						this.allItemsInBuffer = true;
					this.offset += response.records.length;
				}
			}).catch(error => {
				this.loadRec = false;
				console.error(error.message);
			});
	}

  getRandomCampaignRecords(count) {
    this.recordServices.getRandomRecordsFromCollections(this.campaign.targetCollections, count)
      .then(response => {
        if (response.length>0) {
          for (let i in response) {
            let result = response[i];
            if (result !== null) {
              let record = new Record(result);
              this.records.push(record);
            }
          }
        }
      }).catch(error => {
				this.loadRec = false;
        console.log(error.message);
      });
		alert(this.records);
  }

	//Load next record from batch and fill the buffer
	loadRecord() {
		this.loadRec = true;
		console.info(this.records);
		console.info(this.records.length);
		//Fill the buffer
		if(!this.allItemsInBuffer) {
			//Get random records form the campaign
			if (this.records.length < 10) {
				if (this.hasCollection)
					this.getNextCollectionRecords(10);
				else
					this.getRandomCampaignRecords(10).then(response => { });
			}
		}
		console.info(this.records.length);
		this.record = this.records.shift();
		console.info(this.records.shift());
		this.loadRec = false;
		this.showMedia();
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
        console.error(error.message);
      });
  }

  attached() {
    $('.accountmenu').removeClass('active');
		toggleMore(".meta");
  }

  activate(params, routeData) {
		console.info(routeData);
    if (this.userServices.isAuthenticated() && this.userServices.current === null) {
      this.userServices.reloadCurrentUser();
    }
		//Load Campaign
		this.loadCamp = true;
		if (routeData.campaign) {
      this.campaign = routeData.campaign;
      this.loadCamp = false;
		} else {
			this.campaignServices.getCampaignByName(params.cname)
				.then( (result) => {
					this.campaign = new Campaign(result);
					this.loadCamp = false;
			});
		}
		//Load Collection (if any)
		if (routeData.collection) {
			this.collection = routeData.collection;
      this.collectionTitle = this.collection.title;
      this.collectionCount = this.collection.entryCount;
      this.hasCollection = true;
			this.offset = (routeData.offset) ? routeData.offset : 0;
		} else {
			this.hasCollection = false;
		}
		//Load the record
		if (routeData.records)
			this.records = routeData.records;
		console.info(this.records.length);
		this.loadRecord();
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
