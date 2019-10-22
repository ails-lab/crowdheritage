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
import { Campaign } from 'Campaign.js';
import { CampaignServices } from 'CampaignServices.js';
import { UserServices } from 'UserServices.js';
import { Record } from 'Record.js';
import { RecordServices } from 'RecordServices.js';
import { Router } from 'aurelia-router';
import { I18N } from 'aurelia-i18n';
import settings from 'global.config.js';

let COUNT = 7;

@inject(CampaignServices, UserServices, RecordServices, Router, I18N, 'isTesterUser')
export class CampaignIndex {
  scrollTo(anchor) {
    $('html, body').animate({
      scrollTop: $(anchor).offset().top
    }, 1200);
  }

  constructor(campaignServices, userServices, recordServices, router, i18n, isTesterUser) {
    this.campaignServices = campaignServices;
    this.userServices = userServices;
    this.recordServices = recordServices;
    this.router = router;
    this.isTesterUser = isTesterUser();

    this.project = settings.project;

    this.campaigns = [];
    this.campaignsCount = 0;
    this.currentCount = 0;
    this.loading = false;
    this.more = true;
    this.groupName = "";
    this.sortBy = "Date";
    this.state = "all";

    this.i18n = i18n;
    this.currentLocaleCode = this.i18n.getLocale();
  }

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

  get isAuthenticated() { return this.userServices.isAuthenticated(); }

  activate(params) {
    // If no language is specified, redirect to the English page by default
    if (params.lang == undefined) {
      this.router.navigate("en");
    }
    // Set the page locale
    this.i18n.setLocale(params.lang);
    this.currentLocaleCode = this.i18n.getLocale();

    if (this.userServices.isAuthenticated() && this.userServices.current === null) {
      this.userServices.reloadCurrentUser();
    }
    this.campaignServices.getCampaignsCount("", this.project, this.state)
      .then( result => {
        this.campaignsCount = result;
      });
    this.getCampaigns("", this.sortBy, this.state);

    // Add meta tags in header to include og-metadata to the page
    var ogImage = document.createElement('meta');
    ogImage.setAttribute("property", "og:image");
    ogImage.content = "/img/assets/img/content/bg-search-space.png";
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
    ogTitle.content = "CrowdHeritage";
    ogTitle.id = "ogTitle";
    document.head.appendChild(ogTitle);

    var ogDescription = document.createElement('meta');
    ogDescription.setAttribute("property", "og:description");
    ogDescription.content = this.i18n.tr('index:description');
    ogDescription.id = "ogDescription";
    document.head.appendChild(ogDescription);
  }

  getCampaigns(groupName, sortBy, state) {
	  this.campaigns = [];

    this.loading = true;
    this.campaignServices.getCampaigns( {group: groupName, project: this.project, state: state, sortBy: sortBy, offset: 0, count: COUNT} )
      .then( (resultsArray) => {
        if (this.loading) {
          this.fillCampaignArray((this.campaigns), resultsArray);
          this.currentCount = this.currentCount + resultsArray.length;
          if (this.currentCount >= this.campaignsCount) {
            this.more = false;
          }
          this.loading = false;
        }
      });
  }

  fillCampaignArray(campaignArray, results) {
		for (let item of results) {
      // Based on the selected language, set the campaign {title, description, instructions, prizes}
      item.title = ( item.title[this.currentLocaleCode] ? item.title[this.currentLocaleCode] : item.title['en'] );
      item.description = ( item.description[this.currentLocaleCode] ? item.description[this.currentLocaleCode] : item.description['en'] );
      item.instructions = ( item.instructions[this.currentLocaleCode] ? item.instructions[this.currentLocaleCode] : item.instructions['en'] );
      item.prizes.gold = ( item.prizes.gold[this.currentLocaleCode] ? item.prizes.gold[this.currentLocaleCode] : item.prizes.gold['en'] );
      item.prizes.silver = ( item.prizes.silver[this.currentLocaleCode] ? item.prizes.silver[this.currentLocaleCode] : item.prizes.silver['en'] );
      item.prizes.bronze = ( item.prizes.bronze[this.currentLocaleCode] ? item.prizes.bronze[this.currentLocaleCode] : item.prizes.bronze['en'] );
      item.prizes.rookie = ( item.prizes.rookie[this.currentLocaleCode] ? item.prizes.rookie[this.currentLocaleCode] : item.prizes.rookie['en'] );

			campaignArray.push(new Campaign(item));
		}
  }

  loadMore() {
    this.loading = true;
    this.campaignServices.getCampaigns( {group: this.groupName, project: this.project, state: this.state, sortBy: this.sortBy, offset: this.currentCount, count: COUNT} )
      .then( (resultsArray) => {
        this.fillCampaignArray((this.campaigns), resultsArray);
        this.currentCount = this.currentCount + resultsArray.length;
        if (this.currentCount === this.campaignsCount) {
          this.more = false;
        }
      });
    this.loading = false;
  }

  goToRandomItem(camp, col, records, offset) {
    let item = this.router.routes.find(x => x.name === 'item');
    let recs = [];
    item.campaign = camp;
    item.collection = 0;
    item.offset = offset;

    // Get 2 random records to start annotating
    this.loading = true;
    this.recordServices.getRandomRecordsFromCollections(camp.targetCollections, 2)
      .then(response => {
        if (response.length>0) {
          for (let i in response) {
            let result = response[i];
            if (result !== null) {
              let record = new Record(result);
              recs.push(record);
            }
          }
          this.loading = false;
          item.records = recs;
          this.router.navigateToRoute('item', {cname: camp.username, lang: this.currentLocaleCode, recid: recs[0].dbId});
        }
        })
      .catch(error => {
        this.loading = false;
        console.log(error.message);
      });
  }

  toggleSortMenu() {
    if ($('.sort').hasClass('open')) {
      $('.sort').removeClass('open');
    }
    else {
      $('.sort').addClass('open');
    }
  }

  toggleStateMenu() {
    document.getElementById("state-menu").classList.toggle("open");
  }

  reloadCampaigns(state, sortBy) {
    if ( (state==this.state) && (sortBy==this.sortBy) ) {
			return;
		}
		else {
      this.campaigns.splice(0, this.campaigns.length);
      this.currentCount = 0;
      this.more = true;
      this.sortBy = sortBy;
      this.state = state;
      this.campaignServices.getCampaignsCount("", this.project, this.state)
        .then( result => {
          this.campaignsCount = result;
          this.getCampaigns(this.groupName, this.sortBy, this.state);
        });
      }
  }

}
