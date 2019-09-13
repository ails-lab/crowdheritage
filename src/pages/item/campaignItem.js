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
import { I18N } from 'aurelia-i18n';

let COUNT = 20;

@inject(UserServices, RecordServices, CampaignServices, CollectionServices, Router, I18N)
export class CampaignItem {

  scrollTo(anchor) {
    $('html, body').animate({
      scrollTop: $(anchor).offset().top
    }, 0);
  }

  constructor(userServices, recordServices, campaignServices, collectionServices, router, i18n) {
    this.campaignServices = campaignServices;
    this.collectionServices = collectionServices;
    this.recordServices = recordServices;
    this.userServices = userServices;
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
  }

	get lastItem() {
		return this.offset == (this.collectionCount - 1);
	}

	previousItem() {
    // clear previous media
    this.mediaDiv = '';
	  let item = this.router.routes.find(x => x.name === 'item');
	  item.campaign = this.campaign;
		item.collection = this.collection;
	  item.records = this.records;
    item.previous = this.previous;
    this.records.unshift(this.record);
	  this.records.unshift(this.previous.shift());
    item.records = this.records;
		item.offset = this.offset + 1;
	  this.router.navigateToRoute('item', {cname: this.campaign.username, recid: this.records[0].dbId, lang: this.loc});
	}

  nextItem() {
    // clear previous media
    this.mediaDiv = '';
	  let item = this.router.routes.find(x => x.name === 'item');
	  item.campaign = this.campaign;
		item.collection = this.collection;
    this.previous.unshift(this.record);
    item.previous = this.previous;
	  item.records = this.records;
		item.offset = this.offset + 1;
	  this.router.navigateToRoute('item', {cname: this.campaign.username, recid: this.records[0].dbId, lang: this.loc});
  }

	fillRecordArray(recordDataArray) {
		for (let i in recordDataArray) {
			let recordData = recordDataArray[i];
			if (recordData !== null) {
				let record = new Record(recordData);
				this.records.push(record);
			}
		}
	}

	loadNextCollectionRecords() {
		this.collectionServices.getRecords(this.collection.dbId, this.batchOffset, COUNT)
		.then( response => {
			this.fillRecordArray(response.records);
			this.batchOffset += response.records.length;
			this.loadRecordFromBatch();
		}).catch(error => {
			this.loadRec = false;
			console.error(error.message);
		});
	}

  loadRandomCampaignRecords() {
    this.recordServices.getRandomRecordsFromCollections(this.campaign.targetCollections, COUNT)
      .then(response => {
				this.fillRecordArray(response);
        if (this.recId == this.records[0].dbId) {
				  this.loadRecordFromBatch();
        } else {
          this.recordServices.getRecord(this.recId)
            .then(response => {
              this.records.unshift(new Record(response));
              this.loadRecordFromBatch();
            }).catch(error => {
      				this.loadRec = false;
              console.log(error.message);
            });
        }
      }).catch(error => {
				this.loadRec = false;
        console.log(error.message);
      });
  }

  attached() {
    $('.accountmenu').removeClass('active');
		toggleMore(".meta");

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

  toggleFullscreen(){
    var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
    (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
    (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
    (document.msFullscreenElement && document.msFullscreenElement !== null);

    var docElm = document.documentElement;
    if (!isInFullScreen) {
      if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
      } else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
      } else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
      } else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen();
      }
      screen.orientation.lock("landscape");
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }

	loadRecordFromBatch(){
		this.record = this.records.shift();
		this.loadRec = false;
		this.showMedia();
    // console.info(this.record);
	}

	loadNextRecord() {
		this.loadRec = true;
		if(this.records.length > 1) {
			this.loadRecordFromBatch();
			return;
		}
		//Fill the batch and return the first item
		if (this.collection) {
			this.loadNextCollectionRecords();
		} else {
			this.loadRandomCampaignRecords();
		}
	}

  async activate(params, routeData) {
    this.loc = params.lang;
		this.i18n.setLocale(params.lang);

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
          // Set the campaign title, based on the selected language
          if (typeof(response.title) == 'object') {
            for (var lang in response.title) {
              if (lang == this.loc) {
                response.title = response.title[lang];
              }
            }
            if (typeof(response.title) == 'object') {
              response.title = response.title['en'];
            }
          }
          // Set the campaign description, based on the selected language
          if (typeof(response.description) == 'object') {
            for (var lang in response.description) {
              if (lang == this.loc) {
                response.description = response.description[lang];
              }
            }
            if (typeof(response.description) == 'object') {
              response.description = response.description['en'];
            }
          }

          this.campaign = new Campaign(response);
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
      this.collectionTitle = this.collection.title;
      this.collectionCount = this.collection.entryCount;
			this.offset = (routeData.offset) ? routeData.offset : 0;
			this.batchOffset = this.offset + routeData.records.length;
		}
		if (routeData.records) {
			this.records = routeData.records;
		}
    this.recId = params.recid;
    if (routeData.previous) {
      this.previous = routeData.previous;
    } else {
      this.previous =[];
    }
    //console.info(this.previous);
    //console.info(this.records);
		this.loadNextRecord();
  }

  hasMotivation(name) {
    return !!this.campaign.motivation.includes(name);
  }

  get hasCollection() {
    return (this.collectionTitle.length>0);
  }

	toggleLoadMore(container) {
		toggleMore(container);
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

  goToCamp(camp) {
    let summary = this.router.routes.find(x => x.name === 'summary');
    summary.campaign = camp;
    this.router.navigateToRoute('summary', {cname: camp.username, lang: this.loc});
  }

  returnToCollection() {
    this.router.navigateToRoute('collection', {lang: this.loc, cname: this.campaign.username, colid: this.collection.dbId});
  }

  openModal(imgSrc) {
    var modal = document.getElementById("myModal");
    var img = document.getElementById("recImg");
    var modalImg = document.getElementById("modalImg");
    var banner = document.getElementById("banner");
    modal.style.display = "block";
    banner.style.display = "none";
    modalImg.src = imgSrc;
  }

  closeModal() {
    var modal = document.getElementById('myModal');
    var banner = document.getElementById("banner");
    banner.style.display = "block";
    modal.style.display = "none";
  }

}
