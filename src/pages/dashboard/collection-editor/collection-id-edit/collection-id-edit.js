import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Collection } from 'Collection.js';
import { CollectionServices } from 'CollectionServices.js';
import { UserServices } from 'UserServices';
import { I18N } from 'aurelia-i18n';
//import settings from 'global.config.js';

let instance = null;

@inject(CollectionServices, UserServices, Router, I18N)
export class CollectionIdEdit {

  constructor(collectionServices, userServices, router, i18n) {
		if (instance) {
			return instance;
		}
	  this.collectionServices = collectionServices;
	  this.userServices = userServices;
	  this.router = router;
    this.i18n = i18n;
    this.importMethod = ''


    this.loc;
	  if (!instance) {
			instance = this;
		}
  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }
  get user() { return this.userServices.current}

toggleImportMenu() {
  if ($('.import-wrap').hasClass('open')) {
    $('.import-wrap').removeClass('open');
  }
  else {
    $('.import-wrap').addClass('open');
  }
}
  attached() {
	  $('.accountmenu').removeClass('active');
	}

  importEuropeanaCollection() {
    document.getElementById("mySidebar").style.width = "450px";
    document.getElementById("mySidebar").style.boxShadow = "0px 0px 10px 0px rgba(0,0,0,.6)"
    this.importMethod = 'Europeana Dataset'
  }

  importEuropeanaSearch() {
    document.getElementById("mySidebar").style.width = "450px";
    document.getElementById("mySidebar").style.boxShadow = "0px 10px 10px 0px rgba(0,0,0,.6)"
    this.importMethod = 'Europeana Search'
  }

  importEuropeanaGallery() {
    document.getElementById("mySidebar").style.width = "450px";
    document.getElementById("mySidebar").style.boxShadow = "0px 10px 10px 0px rgba(0,0,0,.6)"
    this.importMethod = 'Europeana User Gallery'
  }

  importSingleItem() {
    document.getElementById("mySidebar").style.width = "450px";
    document.getElementById("mySidebar").style.boxShadow = "0px 10px 10px 0px rgba(0,0,0,.6)"
    this.importMethod = 'Single Item'
  }

  closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("mySidebar").style.boxShadow = "none"
    this.importMethod = ''

  }

	async activate(params, route) {
    this.loc = params.lang;
		this.i18n.setLocale(params.lang);
    console.log(params)

		this.cname = params.cname;
		this.collectionId = params.colid;
		let collectionData = await this.collectionServices.getCollection(this.collectionId);
		this.collection = new Collection(collectionData);
    route.navModel.setTitle('Collection | '+this.collection.title[0]);
	}

}
