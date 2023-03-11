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

const COUNT = 10;

@inject(CampaignServices, UserServices, RecordServices, Router, I18N)
export class CampaignIndex {
  scrollTo(anchor) {
    $('html, body').animate({
      scrollTop: $(anchor).offset().top
    }, 1200);
  }

  constructor(campaignServices, userServices, recordServices, router, i18n) {
    this.campaignServices = campaignServices;
    this.userServices = userServices;
    this.recordServices = recordServices;
    this.router = router;

    this.project = settings.project;

    this.campaigns = [];
    this.campaignsCount = 0;
    this.currentCount = 0;
    this.loading = false;
    this.more = true;
    this.groupName = "";
    this.sortBy = "Date_desc";
    this.state = "active";

    this.i18n = i18n;
    this.currentLocaleCode = this.i18n.getLocale();
  }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }

  async activate(params) {
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

    // Set the default state-filter value. If not 'active' campaigns available, search for 'upcoming', or (in absence of them too) set state-filter value to 'all'.
    this.campaignsCount = await this.campaignServices.getCampaignsCount("", this.project, this.state);
    if (this.campaignsCount === 0) {
      this.state = 'upcoming';
      this.campaignsCount = await this.campaignServices.getCampaignsCount("", this.project, this.state);
      if (this.campaignsCount === 0) {
        this.state = 'all';
        this.campaignsCount = await this.campaignServices.getCampaignsCount("", this.project, this.state);
      }
    }

    this.getCampaigns("", this.sortBy, this.state);
  }

  getCampaigns(groupName, sortBy, state) {
	  this.campaigns = [];

    this.loading = true;
    this.campaignServices.getCampaigns( {group: groupName, project: this.project, state: state, sortBy: sortBy, offset: 0, count: COUNT} )
      .then( (resultsArray) => {
        if (this.loading) {
          this.fillCampaignArray(this.campaigns, resultsArray);
          this.currentCount = this.currentCount + resultsArray.length;
          if (this.currentCount >= this.campaignsCount) {
            this.more = false;
          }
          this.loading = false;
        }
      });
  }

  fillCampaignArray(campaignArray, results) {
    let localIndex = 0;
		for (let item of results) {
      // Based on the selected language, set the campaign
      let camp = new Campaign(item, this.currentLocaleCode);
      campaignArray.push(camp);
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

  goToCampaign(campaign) {
    let campaignPage = this.router.routes.find(x => x.name === 'summary');
    campaignPage.campaignData = campaign;
    let params = {
      cname: campaign.username,
      lang: this.currentLocaleCode
    };
    this.router.navigateToRoute('summary', params);
  }

}
