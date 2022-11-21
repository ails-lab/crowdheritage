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
import { Router } from 'aurelia-router';
import { Record } from 'Record.js';
import { Campaign } from 'Campaign.js';
import { Collection } from 'Collection.js';
import { UserServices } from 'UserServices';
import { RecordServices } from 'RecordServices.js';
import { CampaignServices } from 'CampaignServices.js';
import { CollectionServices } from 'CollectionServices.js';
import { EventAggregator } from 'aurelia-event-aggregator';
import { toggleMore } from 'utils/Plugin.js';
import { I18N } from 'aurelia-i18n';

let COUNT = 5;

@inject(UserServices, RecordServices, CampaignServices, CollectionServices, EventAggregator, Router, I18N)
export class CampaignItem {

  constructor(userServices, recordServices, campaignServices, collectionServices, eventAggregator, router, i18n) {
    this.userServices = userServices;
    this.recordServices = recordServices;
    this.campaignServices = campaignServices;
    this.collectionServices = collectionServices;
    this.ea = eventAggregator;
    this.router = router;
    this.i18n = i18n;

    this.loc;
    this.campaign = null;
		//If there is a collection
    this.collection = null;
    this.collectionTitle = '';
    this.collectionCount = 0;
		//All the collection items have been retrieved
		this.offset = 0;

		this.record = 0;
		this.records = [];

    this.loadCamp = false;
    this.loadRec = false;
    // this.more = true;

    this.mediaDiv = '';
		this.hideOrShowParam = 'ALL';
    this.recordIds = [];
    this.recordIndex = null;
    this.sortingParam = null;

    this.pollSubscriber = this.ea.subscribe("pollAnnotationAdded", () => {
      this.nextItem();
    });
  }


	previousItem() {
    // clear previous media
    this.mediaDiv = '';
    //TODO add sorting param
	  this.router.navigateToRoute('item', {cname: this.campaign.username, collectionId: this.collectionId, recid: this.recordIds[this.recordIndex - 1], lang: this.loc, hideOrShowMine: this.hideOrShowParam});
	}

  nextItem() {
    // clear previous media
    this.mediaDiv = '';
    //TODO add sorting param
	  this.router.navigateToRoute('item', {cname: this.campaign.username, collectionId: this.collectionId, recid: this.recordIds[this.recordIndex + 1], lang: this.loc, hideOrShowMine: this.hideOrShowParam});
  }

  attached() {
    $('.accountmenu').removeClass('active');

    var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null)
                      || (document.webkitFullscreenElement && document.webkitFullscreenElement !== null)
                      || (document.mozFullScreenElement && document.mozFullScreenElement !== null)
                      || (document.msFullscreenElement && document.msFullscreenElement !== null);

    document.addEventListener("fullscreenchange", function () {
      var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
      (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
      (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
      (document.msFullscreenElement && document.msFullscreenElement !== null);
      if (isInFullScreen) {
        $("body").addClass("fullscreen");
      } else {
        $("body").removeClass("fullscreen");
      }
    }, false);

    document.addEventListener("mozfullscreenchange", function () {
      var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
      (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
      (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
      (document.msFullscreenElement && document.msFullscreenElement !== null);
      if (isInFullScreen) {
        $("body").addClass("fullscreen");
      } else {
        $("body").removeClass("fullscreen");
      }
    }, false);

    document.addEventListener("webkitfullscreenchange", function () {
      var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
      (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
      (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
      (document.msFullscreenElement && document.msFullscreenElement !== null);
      if (isInFullScreen) {
        $("body").addClass("fullscreen");
      } else {
        $("body").removeClass("fullscreen");
      }
    }, false);

    document.addEventListener("msfullscreenchange", function () {
      var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
      (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
      (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
      (document.msFullscreenElement && document.msFullscreenElement !== null);
      if (isInFullScreen) {
        $("body").addClass("fullscreen");
      } else {
        $("body").removeClass("fullscreen");
      }
    }, false);

    document.addEventListener("MSFullscreenChange", function () {
      var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
      (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
      (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
      (document.msFullscreenElement && document.msFullscreenElement !== null);
      if (isInFullScreen) {
        $("body").addClass("fullscreen");
      } else {
        $("body").removeClass("fullscreen");
      }
    }, false);
  }

  detached() {
    if (this.pollSubscriber) {
      this.pollSubscriber.dispose();
    }
  }

  getRecordIds(){
    this.collectionServices.listCollectionRecordIds(this.collectionId, this.hideOrShowParam, this.sortingParam)
      .then(response => {

        this.recordIds = response.recordIds;
        this.recordIndex = this.recordIds.indexOf(this.recId)
        this.isFirstItem = this.recordIndex == 0
        this.isLastItem = this.recordIds[this.recordIds.length - 1] == this.recId;
      })
      .catch(error => {
        console.error(error.message);
      });
  }

  async getRecord(id){
    await this.recordServices.getRecord(id).then(response => {
      this.record = new Record(response)
    })
    .catch(error => {
        console.error(error.message);
        this.router.navigateToRoute('summary', {cname: camp.username, lang: this.loc});
      });
  }

  async activate(params, routeData, routeConfig) {
    this.loc = params.lang;
		this.i18n.setLocale(params.lang);
    
    this.recId = params.recid;
    this.collectionId = routeConfig.queryParams  ? routeConfig.queryParams.collectionId : null;
    this.hideOrShowParam = routeConfig.queryParams && routeConfig.queryParams.hideOrShowMine ? routeConfig.queryParams.hideOrShowMine : 'ALL';
    //TODO add sorting param
    this.sortingParam = null;

    this.getRecord(this.recId);
    this.getRecordIds();

    if (this.userServices.isAuthenticated() && this.userServices.current === null) {
      this.userServices.reloadCurrentUser();
    }
		//Load Campaign
		this.loadCamp = true;
		if (routeData.campaign) {
      this.campaign = routeData.campaign;
      this.loadCamp = false;
		}
    else {
			let result = await this.campaignServices.getCampaignByName(params.cname)
        .then(response => {
          // Based on the selected language, set the campaign
          this.campaign = new Campaign(response, this.loc);
        })
        .catch(error => {
          let index = this.router.routes.find(x => x.name === 'index');
          this.router.navigateToRoute('index', {lang: 'en'});
        });
			this.loadCamp = false;
		}
		//Load Collection (if any)
		if (routeData.collection) {
			this.collection = routeData.collection;
      this.collectionTitle = this.collection.title[this.loc] && this.collection.title[this.loc][0] !== 0 ? this.collection.title[this.loc][0] : this.collection.title.default[0];
      this.collectionCount = this.collection.entryCount;
			this.offset = (routeData.offset) ? routeData.offset : 0;
			this.batchOffset = this.offset + routeData.records.length;
		}
    else {
      let collectionData = await this.collectionServices.getCollection(this.collectionId);
		  this.collection = new Collection(collectionData);
      this.collectionTitle = this.collection.title[this.loc] && this.collection.title[this.loc][0] !== 0 ? this.collection.title[this.loc][0] : this.collection.title.default[0];
    }

		if (routeData.records) {
			this.records = routeData.records;
		}
		if (routeData.hideOrShowMine) {
			this.hideOrShowMine =  routeData.hideOrShowMine;
		}
  }

  get hasCollection() {
    return (this.collectionTitle.length>0);
  }

	toggleLoadMore(container) {
		toggleMore(container);
	}


  goToCamp(camp) {
    let summary = this.router.routes.find(x => x.name === 'summary');
    summary.campaign = camp;
    this.router.navigateToRoute('summary', {cname: camp.username, lang: this.loc});
  }

  returnToCollection() {
    this.router.navigateToRoute('collection', {lang: this.loc, cname: this.campaign.username, colid: this.collection.dbId});
  }

}
