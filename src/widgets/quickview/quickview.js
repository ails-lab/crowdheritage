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
import { EventAggregator } from 'aurelia-event-aggregator';
import { toggleMore } from 'utils/Plugin.js';
import { I18N } from 'aurelia-i18n';

@inject(UserServices, RecordServices, CampaignServices, CollectionServices, EventAggregator, Router, I18N)
export class quickview {



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


		this.record = 0;


    this.loadCamp = false;
     this.mediaDiv = '';


  }

  attached() {
   if(this.record){
			$('.action').removeClass('active');
			$('.action.itemview').addClass('active');}
  }

  async activate(params, routeData) {
    this.loc = params.lang;
		this.i18n.setLocale(params.lang);

    if (this.userServices.isAuthenticated() && this.userServices.current === null) {
      this.userServices.reloadCurrentUser();
    }
		//Load Campaign
		this.loadCamp = true;

		let result = await this.campaignServices.getCampaignByName(params.cname)
        .then(response => {
          // Based on the selected language, set the campaign {title, description, instructions, prizes}
          response.title = ( response.title[this.loc] ? response.title[this.loc] : response.title['en'] );
          response.description = ( response.description[this.loc] ? response.description[this.loc] : response.description['en'] );
          response.instructions = ( response.instructions[this.loc] ? response.instructions[this.loc] : response.instructions['en'] );
          response.prizes.gold = ( response.prizes.gold[this.loc] ? response.prizes.gold[this.loc] : response.prizes.gold['en'] );
          response.prizes.silver = ( response.prizes.silver[this.loc] ? response.prizes.silver[this.loc] : response.prizes.silver['en'] );
          response.prizes.bronze = ( response.prizes.bronze[this.loc] ? response.prizes.bronze[this.loc] : response.prizes.bronze['en'] );
          response.prizes.rookie = ( response.prizes.rookie[this.loc] ? response.prizes.rookie[this.loc] : response.prizes.rookie['en'] );

          this.campaign = new Campaign(response);
        })
        .catch(error => {

        });
      this.loadCamp = false;
      this.record = params.record;
      if (params.collection) {
          this.collection = params.collection;
          this.collectionTitle = this.collection.title;
          this.collectionCount = this.collection.entryCount;

		  }

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

  closeTab() {
     $('.action.itemview').removeClass('active');
	}

}
