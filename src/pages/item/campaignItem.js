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
import { I18N } from 'aurelia-i18n';

@inject(Router, UserServices, RecordServices, CampaignServices, CollectionServices, EventAggregator, I18N)
export class CampaignItem {

  constructor(router, userServices, recordServices, campaignServices, collectionServices, eventAggregator, i18n) {
    this.userServices = userServices;
    this.recordServices = recordServices;
    this.campaignServices = campaignServices;
    this.collectionServices = collectionServices;
    this.ea = eventAggregator;
    this.router = router;
    this.i18n = i18n;

    this.loc = '';
    this.campaign = null;
    this.collection = null;
    this.collectionTitle = '';
    this.collectionCount = 0;
    this.recordIds = [];
    this.record = null;
    this.recordIndex = -1;
    this.filterBy = 'ALL';
    this.sortByContributionCount = false;
    this.loadCamp = false;
    this.loadRec = false;

    this.pollSubscriber = this.ea.subscribe("pollAnnotationAdded", () => {
      this.goToItem('next');
    });
  }

  handleFullscreen() {
    let isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null)
      || (document.webkitFullscreenElement && document.webkitFullscreenElement !== null)
      || (document.mozFullScreenElement && document.mozFullScreenElement !== null)
      || (document.msFullscreenElement && document.msFullscreenElement !== null);
    if (isInFullScreen) {
      $("body").addClass("fullscreen");
    } else {
      $("body").removeClass("fullscreen");
    }
  }

  attached() {
    $('.accountmenu').removeClass('active');
    document.addEventListener("fullscreenchange", this.handleFullscreen(), false);
    document.addEventListener("mozfullscreenchange", this.handleFullscreen(), false);
    document.addEventListener("webkitfullscreenchange", this.handleFullscreen(), false);
    document.addEventListener("msfullscreenchange", this.handleFullscreen(), false);
    document.addEventListener("MSFullscreenChange", this.handleFullscreen(), false);
  }

  detached() {
    if (this.pollSubscriber) {
      this.pollSubscriber.dispose();
    }
  }

  async activate(params, routeData) {
    if (this.userServices.isAuthenticated() && this.userServices.current === null) {
      this.userServices.reloadCurrentUser();
    }
    this.loc = params.lang;
		this.i18n.setLocale(params.lang);
    this.recId = params.recid;
    this.collectionId = params.collectionId ? params.collectionId : null;
    this.filterBy = params.filterBy ? params.filterBy : 'ALL';
    this.sortByContributionCount = params.sortBy ? params.sortBy : null;

		//Load Campaign
    if (routeData.campaign) {
      // Shallow copy the campaign-data
      this.campaign = Object.assign({}, routeData.campaign);
      // Clean up campaign-data to avoid having stale route data
      routeData.campaign = null;
    }
    else {
  		this.loadCamp = true;
      this.campaignServices.getCampaignByName(params.cname)
        .then(response => {
          this.campaign = new Campaign(response, this.loc);
          this.loadCamp = false;
        })
        .catch(error => {
          let index = this.router.routes.find(x => x.name === 'index');
          this.router.navigateToRoute('index', {lang: 'en'});
        });
    }

		// Load Collection
		if (routeData.collection) {
      // Shallow copy the collection-data
      this.collection = Object.assign({}, routeData.collection);
      // Clean up collection-data to avoid having stale route data
      routeData.collection = null;
		}
    else {
      let collectionData = await this.collectionServices.getCollection(this.collectionId);
		  this.collection = new Collection(collectionData);
    }
    this.collectionTitle = this.collection.title[this.loc] && this.collection.title[this.loc][0] !== 0 ? this.collection.title[this.loc][0] : this.collection.title.default[0];

    // Load RecordIds
    if (routeData.recordIds) {
      // Shallow copy the recordIds-data
      this.recordIds = Object.assign([], routeData.recordIds);
      // Clean up recordIds-data to avoid having stale route data
      routeData.recordIds = null;
    }
    else {
      let response = await this.collectionServices.getCollectionRecordIds(this.collection.dbId, this.filterBy, this.sortByContributionCount, params.cname);
      this.recordIds = response.recordIds;
    }
    this.collectionCount = this.recordIds.length;
    this.recordIndex = (routeData.recordIndex) ? routeData.recordIndex : this.recordIds.indexOf(this.recId);
    // Clean up recordIndex-data to avoid having stale route data
    routeData.recordIndex = null;
    this.isFirstItem = this.recordIndex == 0;
    this.isLastItem = this.recordIds[this.recordIds.length - 1] == this.recId;

    // Load Record
    if (routeData.record) {
      // Shallow copy the record-data
      this.record = Object.assign({}, routeData.record);
      // Clean up record-data to avoid having stale route data
      routeData.record = null;
    }
    else {
      this.loadRec = true;
      await this.recordServices.getRecord(this.recId)
        .then(response => {
          this.record = new Record(response);
          this.loadRec = false;
        })
        .catch(error => {
          console.error(error.message);
          this.returnToCampaign();
        });
    }
  }

  goToItem(direction) {
    let index = (direction ==  'previous') ? this.recordIndex - 1 : this.recordIndex + 1;

    let item = this.router.routes.find(x => x.name === 'item');
    item.campaign = this.campaign;
    item.collection = this.collection;
    item.recordIds = this.recordIds;
    item.recordIndex = index;
    item.record = null;

    let params = {
      cname: this.campaign.username,
      collectionId: this.collectionId,
      recid: this.recordIds[index],
      lang: this.loc,
    };
    if (this.sortByContributionCount) {
      params.sortBy = true;
    }
    if (this.filterBy != "ALL") {
      params.filterBy = this.filterBy;
    }

	  this.router.navigateToRoute('item', params);
	}

  returnToCampaign() {
    let summary = this.router.routes.find(x => x.name === 'summary');
    summary.campaign = this.campaign;
    this.router.navigateToRoute('summary', {cname: this.campaign.username, lang: this.loc});
  }

  returnToCollection() {
    this.router.navigateToRoute('collection', {lang: this.loc, cname: this.campaign.username, colid: this.collection.dbId});
  }

}
