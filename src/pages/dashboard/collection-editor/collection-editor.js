import { inject, LogManager, NewInstance } from 'aurelia-framework';
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { Router } from 'aurelia-router';
import { Campaign } from 'Campaign.js';
import { CampaignServices } from 'CampaignServices.js';
import { Collection } from 'Collection.js';
import { CollectionServices } from 'CollectionServices.js';
import { UserServices } from 'UserServices';
import { I18N } from 'aurelia-i18n';
import settings from 'global.config.js';
let logger = LogManager.getLogger('CollectionEditor.js');

let COUNT = 10;

@inject(CampaignServices, CollectionServices, UserServices, Router, I18N, 'isTesterUser')
export class CollectionEditor {
  constructor(campaignServices, collectionServices, userServices, router, i18n, isTesterUser) {
    this.project = settings.project;
    this.loc = window.location.href.split('/')[3];
    this.campaignServices = campaignServices;
    this.collectionServices = collectionServices;
    this.userServices = userServices;
    // this.recordServices = recordServices;
    this.router = router;
    this.i18n = i18n;
    // this.isTesterUser = isTesterUser();
    this.more = true;
    this.isCreator = false;
    this.campaign = 0;
    this.collectionsCount = 0;
    this.collections = [];
    this.loading = false;
    this.currentCount = 0;
    this.count = 6;
    this.importMethod = ''
  }

  activate(params, route) {
    if (this.i18n.getLocale() != this.locale) {
      this.i18n.setLocale(this.locale);
    }
    this.campaignServices.getCampaignByName("hungarian-history")
      .then( (result) => {
        // Based on the selected language, set the campaign
        this.campaign = new Campaign(result, this.loc);
        // route.navModel.setTitle(this.campaign.title);
        this.collectionsCount = this.campaign.targetCollections.length;
        this.getCampaignCollections(this.campaign.targetCollections, 0, this.count);
        // this.isCreator = this.isAuthenticated && this.campaign.creators.includes(this.user.dbId);
    });
  }

  getCampaignCollections(colIds, offset, count) {
    this.loading = true;
    var self = this;
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

  toggleImportMenu() {
    if ($('.import-wrap').hasClass('open')) {
      $('.import-wrap').removeClass('open');
    }
    else {
      $('.import-wrap').addClass('open');
    }
  }
  
  closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("mySidebar").style.boxShadow = "none"
    this.importMethod = ''

  }

  importEuropeanaCollection(){
    document.getElementById("mySidebar").style.width = "450px";
    document.getElementById("mySidebar").style.boxShadow = "0px 0px 10px 0px rgba(0,0,0,.6)"
    this.importMethod = 'Europeana Dataset'
  }

  importEuropeanaSearch(){
    document.getElementById("mySidebar").style.width = "450px";
    document.getElementById("mySidebar").style.boxShadow = "0px 10px 10px 0px rgba(0,0,0,.6)"
    this.importMethod = 'Europeana Search'
  }

  importEuropeanaGallery(){
    document.getElementById("mySidebar").style.width = "450px";
    document.getElementById("mySidebar").style.boxShadow = "0px 10px 10px 0px rgba(0,0,0,.6)"
    this.importMethod = 'Europeana Gallery'
  }
}
