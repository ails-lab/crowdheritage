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
export class CampaignSummary {
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
    this.count=4;
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
    this.count=4;
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
    if(!this.initgrid){
	    this.taskQueue.queueTask(() => {
		    initAureliaIsotope(this.grid);
		});

		if(this.collections.length>0){

			this.taskQueue.queueTask(() => {
				aureliaIsoImagesLoaded(this.grid, $('.isoload'),this.thisVM);
				initTooltip();
			});
		}
		this.initgrid=true;

	}
	else{
	        isoRelay();
			$( '[data-grid="isotope" ]' ).find('.entry').removeClass('isoload');
	}
    this.taskQueue.queueTask(() => {
        // setMap();

    });
  }

   activate(params, route) {

      this.resetInstance();
      this.campaignServices.getCampaignByName(params.cname)
        .then( (result) => {
          this.campaign = new Campaign(result);
          this.getUserPoints();
          if (this.userServices.isAuthenticated()) {
            this.getUserRank(this.userServices.current.dbId);
          }
          route.navModel.setTitle(this.campaign.title);
          this.collectionsCount = this.campaign.targetCollections.length;
          this.getCampaignCollections(this.campaign.targetCollections, 0, this.count);
          this.getUserStats();
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

      if (this.userPoints < this.campaign.badges.bronze) {
        this.userBadge = '/img/badges.png';
				this.userBadgeName = 'rookie';
      }
      else if (this.userPoints < this.campaign.badges.silver) {
        this.userBadge = '/img/badge-bronze.png';
        this.userBadgeName = 'bronze';
      }
      else if (this.userPoints < this.campaign.badges.gold) {
        this.userBadge = '/img/badge-silver.png';
        this.userBadgeName = 'silver';
      }
      else {
        this.userBadge = '/img/badge-gold.png';
        this.userBadgeName = 'gold';
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
			self.taskQueue.queueTask(() => {
				aureliaIsoImagesLoaded(self.grid, $('.isoload'),self.thisVM);
			});}
       /* for (let i in response) {
          this.collections.push(new Collection(response[i]));
        }*/
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
            this.router.navigateToRoute('item', {cname: camp.username, gname: camp.spacename, recid: this.records[0].dbId});
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
            this.router.navigateToRoute('item', {cname: camp.username, gname: camp.spacename, recid: this.records[0].dbId});
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
