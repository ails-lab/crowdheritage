import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Collection } from 'Collection.js';
import { CollectionServices } from 'CollectionServices.js';
import { UserServices } from 'UserServices';
import { I18N } from 'aurelia-i18n';
//import settings from 'global.config.js';

let instance = null;

@inject(CollectionServices, UserServices, Router, I18N)
export class CampaignCnameEdit {

  constructor(collectionServices, userServices, router, i18n) {
	if (instance) {
		return instance;
	}
	this.collectionServices = collectionServices;
	this.userServices = userServices;
	this.router = router;
    this.i18n = i18n;

    this.loc;
	if (!instance) {
		instance = this;
	}
  }

  // get isAuthenticated() { return this.userServices.isAuthenticated(); }
	// get user() { return this.userServices.current; }

  attached() {
	  $('.accountmenu').removeClass('active');
	}

	async activate(params, route) {
    this.loc = params.lang;
	this.i18n.setLocale(params.lang);

	this.cname = params.cname;
	let collectionData = await this.collectionServices.getCollection(this.collectionId);
	this.collection = new Collection(collectionData);
    //route.navModel.setTitle(this.collection.title[0]+' | '+settings.project);
    route.navModel.setTitle('Campaign | '+this.cname.title[0]);
	}

}
