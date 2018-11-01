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


import { inject, TaskQueue } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Campaign } from 'Campaign.js';
import { CampaignServices } from 'CampaignServices.js';
import { Collection } from 'Collection.js';
import { CollectionServices } from 'CollectionServices.js';
import { Record } from 'Record.js';
import { RecordServices } from 'RecordServices.js';
import { UserServices } from 'UserServices';
import {initAureliaIsotope, aureliaIsoImagesLoaded,isotopeClear,isoRelay,setMap} from 'utils/Plugin.js';

let instance = null;

@inject(CampaignServices, CollectionServices, UserServices, RecordServices, Router,TaskQueue)
export class CollectionSummary {
  scrollTo(anchor) {
    $('html, body').animate({
      scrollTop: $(anchor).offset().top
    }, 1000);
  }

  constructor(campaignServices, collectionServices, userServices, recordServices, router,taskQueue) {
	if (instance) {
			return instance;
		}
    this.campaignServices = campaignServices;
    this.collectionServices = collectionServices;
    this.userServices = userServices;
    this.recordServices = recordServices;
    this.router = router;
    this.records = [];
    this.recId = "";
		this.thisVM=this;
		this.taskQueue=taskQueue;
    this.campaign = 0;
    this.collections = [];
    this.collectionsCount = 0;
    this.currentCount = 0;
    this.loading = false;
    this.more = true;
    this.count= 20;
    this.userTags = 0;
    this.userRecords = 0;
    this.userPoints = 0;
    this.userBadge = 0;
    this.userRank = 0;
    this.userBadgeName = "";
    this.points = [];
    if (!instance) {
			instance = this;
		}
  }

	resetInstance() {
    this.records = [];
    this.recId = "";
    this.campaign = 0;
    this.collections = [];
    this.collectionsCount = 0;
    this.currentCount = 0;
    this.loading = false;
    this.more = true;
    this.count = 20;
    this.userTags = 0;
    this.userRecords = 0;
    this.userPoints = 0;
    this.userBadge = 0;
    this.userRank = 0;
    this.userBadgeName = "";
    this.points = [];
	}


  get isAuthenticated() { return this.userServices.isAuthenticated(); }
	get user() { return this.userServices.current; }

  attached() {
	  $('.accountmenu').removeClass('active');
		// initAureliaIsotope('.campaignlist .entries');
	  // isoRelay();
	  // $('[data-grid="isotope" ]').find('.entry').removeClass('isoload');
	}

	async getCollectionRecords(offset, count) {
		this.loading = true;
		let response = await this.collectionServices.getRecords(this.collectionId, offset, count);
		this.currentCount = this.currentCount + count;
			for (let i in response.records) {
				let recordJSON = response.records[i];
				if (recordJSON !== null)
					this.records.push(new Record(recordJSON));
			}
			if (response.records.length > 0) {
				this.taskQueue.queueTask(() => {
					// aureliaIsoImagesLoaded(this.grid, $('.isoload'),this.thisVM);
				});
			}
			this.loading = false;
	}

   async activate(params, route) {
		 this.resetInstance();
		 this.cname = params.cname;
		 this.gname = params.gname;
		 this.collectionId = params.colid;

		 let collectionJSON = await this.collectionServices.getCollection(this.collectionId);
		 this.collection = new Collection(collectionJSON);
		 this.records = [];
		 await this.getCollectionRecords(0, 20);
  }

  goToItem(record) {
    let item = this.router.routes.find(x => x.name === 'item');
    item.campaign = this.campaign;
    item.offset = this.records.indexOf(record);
		//TODO pass the subarray of items as well
    item.collection= this.collection;
		this.router.navigateToRoute('item', {cname: this.cname, gname: this.gname, recid: this.records[item.offset].dbId});
  }

  async loadMore() {
    await this.getCollectionRecords(this.currentCount, this.count);
  }

  toggleMenu() {
    if ($('.sort').hasClass('open')) {
      $('.sort').removeClass('open');
    }
    else {
      $('.sort').addClass('open');
    }
  }

}
