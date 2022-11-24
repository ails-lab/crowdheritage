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
import { Campaign } from 'Campaign';
import { UserServices } from 'UserServices';
import { CampaignServices } from 'CampaignServices';
import { toggleMore } from 'utils/Plugin.js';
import { I18N } from 'aurelia-i18n';

@inject(UserServices, CampaignServices, I18N)
export class quickview {

  constructor(userServices, campaignServices, i18n) {
    this.userServices = userServices;
    this.campaignServices = campaignServices;
    this.i18n = i18n;

    this.loc;
    this.campaign = null;
    this.record = null;
    this.loadCamp = false;
		// If there is a collection
    this.collection = null;
    this.collectionTitle = '';
    this.collectionCount = 0;
    this.edit = false;
    // If there is a user
    this.userId = '';

    this.mediaDiv = '';
  }

  get hasCollection() { return (this.collectionTitle.length > 0); }
  get hasUser()       { return (this.userUsername.length > 0);    }

  attached() {
   if (this.record && !this.metadataMode) {
			$('.action').removeClass('active');
			$('.action.itemview').addClass('active');
    }
  }

  async activate(params, routeData) {
    this.loc = params.lang;
		this.i18n.setLocale(params.lang);
    this.edit = params.editMode;
    this.metadataMode = params.metadataMode;
    this.record = params.record;

    if (this.userServices.isAuthenticated() && this.userServices.current === null) {
      this.userServices.reloadCurrentUser();
    }
		//Load Campaign
		if (!this.edit) {
      if (params.campaign) {
        this.campaign = params.campaign;
      }
      else {
        this.loadCamp = true;
        let result = await this.campaignServices.getCampaignByName(params.cname)
          .then(response => {
            // Based on the selected language, set the campaign
            this.campaign = new Campaign(response, this.loc);
            this.loadCamp = false;
          })
          .catch(error => {
            console.log(error);
          });
      }
      this.showMedia();
      if (params.collection) {
          this.collection = params.collection;
          this.collectionTitle = this.collection.title;
          this.collectionCount = this.collection.entryCount;
      }
      if (params.userId) {
        this.userId = params.userId;
      }
    }
    else {
      this.showMedia();
      if (params.collection) {
          this.collection = params.collection;
          this.collectionTitle = this.collection.title;
          this.collectionCount = this.collection.entryCount;
      }
      if (params.userId) {
        this.userId = params.userId;
      }
    }
  }

  hasMotivation(name) {
    if(!this.edit){
      return !!this.campaign.motivation.includes(name);
    }
  }

  getCreator(ann) {
    return ann.createdBy[0].username;
  }

  isComputerGenerated(ann) {
    if (ann.createdBy[0].generator == "Image Analysis")
      return true;
    else
      return false;
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
    let mediaPlayer = document.getElementById("mediaplayer");
    if (mediaPlayer) {
      mediaPlayer.pause();
    }
    $('.action.itemview').removeClass('active');
	}

  openModal(imgSrc) {
    var modal = document.getElementById("myModal");
    var img = document.getElementById("recImg");
    var modalImg = document.getElementById("modalImg");
    // var banner = document.getElementById("banner");
    modal.style.display = "block";
    // banner.style.display = "none";
    modalImg.src = imgSrc;
  }

  closeModal() {
    var modal = document.getElementById('myModal');
    // var banner = document.getElementById("banner");
    // banner.style.display = "block";
    modal.style.display = "none";
  }

}
