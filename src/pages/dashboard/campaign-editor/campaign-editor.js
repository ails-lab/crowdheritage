import { inject, LogManager, NewInstance } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Campaign } from 'Campaign.js';
import { CampaignServices } from 'CampaignServices.js';
import { Collection } from 'Collection.js';
import { CollectionServices } from 'CollectionServices.js';
import { UserServices } from 'UserServices';
import { I18N } from 'aurelia-i18n';
import settings from 'global.config.js';
let logger = LogManager.getLogger('CampaignEditor.js');

let COUNT = 9;

@inject(CampaignServices, CollectionServices, UserServices, Router, I18N)
export class CampaignEditor {
  constructor(campaignServices, collectionServices, userServices, router, i18n) {
    this.project = settings.project;
    this.loc = window.location.href.split('/')[3];
    this.campaignServices = campaignServices;
    this.collectionServices = collectionServices;
    this.userServices = userServices;
    // this.recordServices = recordServices;
    this.router = router;
    this.i18n = i18n;
    this.more = true;
    this.isCreator = false;
    this.campaign = 0;
    this.campaigns = [];
    this.collectionsCount = 0;
    this.collections = [];
    this.loading = false;
    this.campaignsCount = 0;
    // this.currentCount = 0;

    // New Campaign Username
    this.campaignUsername = ''
  }

  get user() { return this.userServices.current; }

  async activate(params, route) {
    if (this.i18n.getLocale() != this.locale) {
      this.i18n.setLocale(this.locale);
    }
    if (this.user) {
      this.campaignsCount = await this.campaignServices.getCampaignsCount("", this.project, this.state);
      this.getCampaigns();
    }
  }

  getCampaigns(groupName, sortBy) {
    this.campaigns = [];

    this.loading = true;
    this.campaignServices.getUserCampaigns(this.user.dbId, 0, COUNT)
      .then((resultsArray) => {
        if (resultsArray === 0) {
          this.campaignsCount = 0;
        }
        if (this.loading) {
          this.fillCampaignArray(resultsArray.campaigns);
          // this.currentCount = this.currentCount + resultsArray.length;
          // if (this.currentCount >= this.campaignsCount) {
          //     this.more = false;
          // }
          this.loading = false;
        }
      });
  }

  fillCampaignArray(results) {
    for (let item of results) {
      // Based on the selected language, set the campaign
      let camp = new Campaign(item, this.currentLocaleCode);
      this.campaigns.push(camp);
    }
  }

  toggleImportMenu() {
    if ($('.import-wrap').hasClass('open')) {
      $('.import-wrap').removeClass('open');
    }
    else {
      $('.import-wrap').addClass('open');
    }
  }

  closeNav() {
    document.getElementById("campaignSidebar").style.width = "0";
    document.getElementById("campaignSidebar").style.boxShadow = "none"
    this.campaignUsername = ""
  }

  createCampaignSidebar() {
    document.getElementById("campaignSidebar").style.width = "450px";
    document.getElementById("campaignSidebar").style.boxShadow = "0px 0px 10px 0px rgba(0,0,0,.6)"
  }

  createCampaign() {
    // TODO: Call editCampaign(campaign)
    alert(this.campaignUsername)
  }
}
