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
    this.count = 3;
    this.importMethod = ''
  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }
  get user() { return this.userServices.current; }

  activate(params, route) {
    if (this.i18n.getLocale() != this.locale) {
      this.i18n.setLocale(this.locale);
    }
    if (this.user) {
      this.loading = true;
      let self = this;
      // console.log(this.user)
      this.getCollectionsByUser();
      this.loading = false;
    }

  }

  getCollectionsByUser(){
    this.collectionServices.getCollections(0, 12, true, false, this.user.username).then(response => {
      console.log(response)
      let collectionIds = response.collectionsOrExhibitions.map(col => {
        return col.dbId
      })
      this.collectionsCount = response.totalCollections
      this.count = response.totalCollections
      this.collectionServices.getMultipleCollections(collectionIds, 0, this.count)
        .then(response => {
          this.currentCount = this.currentCount + this.count;
          if (this.currentCount >= this.collectionsCount) {
            // console.lo
            this.more = false;
          }
          if (response.length > 0) {
            for (let i in response) {
              this.collections.push(new Collection(response[i]));
            }
          }
        });
    });
  }

  newCollection() {
    document.getElementById("editSidebar").style.width = "450px";
    document.getElementById("editSidebar").style.boxShadow = "0px 0px 10px 0px rgba(0,0,0,.6)"
    this.edittype = 'new';
    this.editableCollection = null;
  }

  editCollection(collection) {
    document.getElementById("editSidebar").style.width = "450px";
    document.getElementById("editSidebar").style.boxShadow = "0px 0px 10px 0px rgba(0,0,0,.6)"
    this.edittype = 'edit';
    this.editableCollection = collection;
  }

  deleteCollection(collection) {
    if (window.confirm("Do you really want to delete this collection?")) {
      this.collectionServices.delete(collection.dbId).then(response => {
        console.log(response)
        this.getCollectionsByUser();
      })
    }
  }
}
