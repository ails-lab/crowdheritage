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
import { I18N } from 'aurelia-i18n';
import { setMap } from 'utils/Plugin.js';

let instance = null;

@inject(CampaignServices, CollectionServices, UserServices, RecordServices, Router, TaskQueue, I18N, 'isTesterUser')
export class CampaignSummary {
  scrollTo(anchor) {
    $('html, body').animate({
      scrollTop: $(anchor).offset().top
    }, 1000);
  }

  constructor(campaignServices, collectionServices, userServices, recordServices, router, taskQueue, i18n, isTesterUser) {
  	if (instance) {
  			return instance;
  		}
      this.loc = window.location.href.split('/')[3];
      this.campaignServices = campaignServices;
      this.collectionServices = collectionServices;
      this.userServices = userServices;
      this.recordServices = recordServices;
      this.router = router;
      this.i18n = i18n;
      this.isTesterUser = isTesterUser();

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
      this.count=6;
      this.userTags = 0;
      this.userRecords = 0;
      this.userPoints = 0;
      this.userBadge = 0;
      this.userRank = 0;
      this.userBadgeName = "";
      this.userBadgeText = "";
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
    this.count=6;
    this.userTags = 0;
    this.userRecords = 0;
    this.userPoints = 0;
    this.userBadge = 0;
    this.userRank = 0;
    this.userBadgeName = "";
    this.userBadgeText = "";
    this.points = [];
	}


  get isAuthenticated() { return this.userServices.isAuthenticated(); }
	get user() { return this.userServices.current; }
  get locale() { return window.location.href.split('/')[3]; }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  detached() {
    var ogImage = document.getElementById('ogImage');
    var ogType = document.getElementById('ogType');
    var ogUrl = document.getElementById('ogUrl');
    var ogTitle = document.getElementById('ogTitle');
    var ogDescription = document.getElementById('ogDescription');
    ogImage.remove();
    ogType.remove();
    ogUrl.remove();
    ogTitle.remove();
    ogDescription.remove();
  }

  activate(params, route) {
    if (this.i18n.getLocale() != this.locale) {
      this.i18n.setLocale(this.locale);
    }
    this.resetInstance();
    this.campaignServices.getCampaignByName(params.cname)
      .then( (result) => {
        // Based on the selected language, set the campaign {title, description, instructions, prizes}
        result.title = ( result.title[this.loc] ? result.title[this.loc] : result.title['en'] );
        result.description = ( result.description[this.loc] ? result.description[this.loc] : result.description['en'] );
        result.instructions = ( result.instructions[this.loc] ? result.instructions[this.loc] : result.instructions['en'] );
        result.prizes.gold = ( result.prizes.gold[this.loc] ? result.prizes.gold[this.loc] : result.prizes.gold['en'] );
        result.prizes.silver = ( result.prizes.silver[this.loc] ? result.prizes.silver[this.loc] : result.prizes.silver['en'] );
        result.prizes.bronze = ( result.prizes.bronze[this.loc] ? result.prizes.bronze[this.loc] : result.prizes.bronze['en'] );
        result.prizes.rookie = ( result.prizes.rookie[this.loc] ? result.prizes.rookie[this.loc] : result.prizes.rookie['en'] );

        this.campaign = new Campaign(result);
        this.getUserPoints();
        if (this.userServices.isAuthenticated()) {
          this.getUserRank(this.userServices.current.dbId);
        }
        route.navModel.setTitle(this.campaign.title);
        this.collectionsCount = this.campaign.targetCollections.length;
        this.getCampaignCollections(this.campaign.targetCollections, 0, this.count);
        this.getUserStats();

        // Add meta tags in header to include og-metadata to the page
        var ogImage = document.createElement('meta');
        ogImage.setAttribute("property", "og:image");
        ogImage.content = this.campaign.banner;
        ogImage.id = "ogImage";
        document.head.appendChild(ogImage);

        var ogType = document.createElement('meta');
        ogType.setAttribute("property", "og:type");
        ogType.content = "website";
        ogType.id = "ogType";
        document.head.appendChild(ogType);

        var ogUrl = document.createElement('meta');
        ogUrl.setAttribute("property", "og:url");
        ogUrl.content = window.location.href;
        ogUrl.id = "ogUrl";
        document.head.appendChild(ogUrl);

        var ogTitle = document.createElement('meta');
        ogTitle.setAttribute("property", "og:title");
        ogTitle.content = this.campaign.title;
        ogTitle.id = "ogTitle";
        document.head.appendChild(ogTitle);

        var ogDescription = document.createElement('meta');
        ogDescription.setAttribute("property", "og:description");
        ogDescription.content = this.campaign.description;
        ogDescription.id = "ogDescription";
        document.head.appendChild(ogDescription);
    });
  }

  getUserStats() {
    if (this.userServices.current) {
      let id = this.userServices.current.dbId;
      if (this.campaign.userPoints.hasOwnProperty(id)) {
        this.userTags = this.campaign.userPoints[id].created;
        this.userRecords = this.campaign.userPoints[id].records;
        this.userPoints = this.userTags +
                          this.campaign.userPoints[id].approved +
                          this.campaign.userPoints[id].rejected;
      }

      // // Old badge awards based on points, now obsolete
      // if (this.userPoints < this.campaign.badges.bronze) {
      // else if (this.userPoints < this.campaign.badges.silver) {
      // else if (this.userPoints < this.campaign.badges.gold) {
      // else {

      // New badge awards based on RANK
      if (this.userRank == '1') {
        this.userBadge = '/img/badge-gold.png';
        this.userBadgeName = 'gold';
        this.userBadgeText = this.campaign.prizes.gold;
      }
      else if (this.userRank == '2') {
        this.userBadge = '/img/badge-silver.png';
        this.userBadgeName = 'silver';
        this.userBadgeText = this.campaign.prizes.silver;
      }
      else if (this.userRank == '3') {
        this.userBadge = '/img/badge-bronze.png';
        this.userBadgeName = 'bronze';
        this.userBadgeText = this.campaign.prizes.bronze;
      }
      else {
        this.userBadge = '/img/badges.png';
				this.userBadgeName = 'rookie';
				this.userBadgeText = this.campaign.prizes.rookie;
      }
    }
  }

  getUserPoints() {
    // Convert user points object into an array formatted like:
    // [[userId1,totalScore1], [userId2,totalScore2], ...]
    // and sort it in descending order based on user's total points
    Object.keys(this.campaign.userPoints).forEach( userId => {
      let score = this.campaign.userPoints[userId].created +
                  this.campaign.userPoints[userId].approved +
                  this.campaign.userPoints[userId].rejected;
      this.points.push([userId, score]);
    });
    this.points.sort( function(a, b) {
      return b[1] - a[1];
    });
  }

  getUserRank(userId) {
    this.points.forEach((points, i) => {
      if (userId == points[0]) {
        this.userRank = ++i;
      }
    });
    if (this.userRank == 0) {
      this.userRank = '-';
    }
  }

  getCampaignCollections(colIds, offset, count) {
    this.loading = true;
    var self=this;
    this.collectionServices.getMultipleCollections(colIds, offset, count)
      .then( response => {
        this.currentCount = this.currentCount + count;
        if (this.currentCount >= this.collectionsCount) {
          this.more = false;
        }
        if(response.length>0){
        	for (let i in response) {
            self.collections.push(new Collection(response[i]));
          }
				}
			});
    this.loading = false;
  }

  goToItem(camp, col, records, offset) {
    let item = this.router.routes.find(x => x.name === 'item');
    item.campaign = camp;
    item.offset = offset;
    this.records=[];
    // Get 2 random records to start annotating
    if (col == 0) {
      this.loading = true;
      this.recordServices.getRandomRecordsFromCollections(this.campaign.targetCollections, 2)
        .then(response => {
          if (response.length>0) {
            for (let i in response) {
              let result = response[i];
              if (result !== null) {
                let record = new Record(result);
                this.records.push(record);
              }
            }
            this.loading = false;
            item.collection = 0;
            item.records = this.records;
            this.router.navigateToRoute('item', {lang: this.loc, cname: camp.username, recid: this.records[0].dbId});
          }
          })
        .catch(error => {
          this.loading = false;
          console.log(error.message);
        });
    }

    // Get the first 2 records from the given collection
    else {
      this.loading = true;
      this.collectionServices.getRecords(col.dbId, 0, 2)
        .then(response => {
          if (response.records.length>0) {
            for (let i in response.records) {
              let result = response.records[i];
              if (result !== null) {
                let record = new Record(result);
                this.records.push(record);
              }
            }
            this.loading = false;
            item.collection = col;
            item.records = this.records;
            this.router.navigateToRoute('item', {cname: camp.username, recid: this.records[0].dbId});
          }
        }).catch(error => {
          this.loading = false;
          console.log(error.message);
        });
    }
  }

  loadMore() {
    this.getCampaignCollections(this.campaign.targetCollections, this.currentCount, this.count);
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
