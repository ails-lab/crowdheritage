import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Collection } from 'Collection.js';
import { CollectionServices } from 'CollectionServices.js';
import { UserServices } from 'UserServices';
import { I18N } from 'aurelia-i18n';
//import settings from 'global.config.js';

let instance = null;

@inject(CollectionServices, Router, I18N)
export class Newcollection {

  constructor(collectionServices, router, i18n) {
    if (instance) {
      return instance;
    }
    this.collectionServices = collectionServices;
    this.router = router;
    this.i18n = i18n;
    this.importMethod = '';
    this.loc;
    this.resourceType = 'collection';
    if (!instance) {
      instance = this;
    }
    this.access = [
      {
        value: 'Private',
        bool: false
      },
      {
        value: 'Public',
        bool: true
      }
    ];
    this.selectedAccess = false;
    this.title = '';
    this.about = ''
    this.collection = new Collection();
  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }
  get user() { return this.userServices.current; }

  attached() {
  }

  async activate(params, route) {
    this.edit = params.type === 'edit' ? true : false;
    if (params.collection) {
      this.collection = params.collection
      this.selectedAccess = this.collection.isPublic;
      this.title = this.collection.title
      this.desc = this.collection.description
    }
    else {
      this.collection = new Collection()
      this.collection.isPublic = false
      this.selectedAccess = false
      this.title = '';
      this.desc = ''
    }
  }


  
}
