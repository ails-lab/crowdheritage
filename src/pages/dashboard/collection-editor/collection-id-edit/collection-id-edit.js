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
//   get user() { return {
//     "dbId": "57fe58d14c747959989c8b0d",
//     "firstName": "Super",
//     "lastName": "User",
//     "email": "annachristaki@gmail.com",
//     "username": "superuser",
//     "about": "WITH superuser",
//     "gender": "Male",
//     "avatar": {
//         "Original": "/media/5e1db063e06c9d7f2a97dbac?file=true",
//         "Thumbnail": "/media/5e1db064e06c9d7f2a97dbb2?file=true",
//         "Square": "/media/5e1db064e06c9d7f2a97dbb0?file=true",
//         "Tiny": "/media/5e1db064e06c9d7f2a97dbae?file=true",
//         "Medium": "/media/5e1db064e06c9d7f2a97dbb4?file=true"
//     },
//     "facebookId": "",
//     "googleId": null,
//     "favoritesCollection": "57fe58d14c747959989c8b0e",
//     "userGroupsIds": [],
//     "adminInGroups": [
//         "5b1928cd4c747977dde143ef",
//         "5de510ba4c74791c94091ef7",
//         "5de515a84c74791c94091f13",
//         "5de50fa34c74791c94091eda",
//         "58dbae694c747909a7bd055d",
//         "5de501c64c74791c94091c07",
//         "58ac36484c7479351f881a43",
//         "58ad9cbe4c7479351f882778",
//         "58ca9e344c747974869c5142",
//         "58aafa984c7479351f880455",
//         "58ada1f94c7479351f8827c0",
//         "56efc9172260ea22b0324cd2",
//         "5de517434c74791c94091f24",
//         "5bd04ee24c74794b966a0818",
//         "5b19270a4c747977dde143d0",
//         "5de51a0a4c74791c94091f3d",
//         "5de518bf4c74791c94091f34",
//         "56cd967d75fe2461e0890fa3",
//         "58ac608a4c7479351f88201a",
//         "5de503894c74791c94091d13",
//         "58ac30f54c7479351f880ba3",
//         "5de503324c74791c94091cda",
//         "58ada1844c7479351f8827ad",
//         "5de518424c74791c94091f2d",
//         "5de503184c74791c94091ccc",
//         "5880dc164c74797363e2c876",
//         "5de50fc84c74791c94091ee1",
//         "58ac2f144c7479351f880af2",
//         "5de515874c74791c94091f0c",
//         "5de502d64c74791c94091c9f",
//         "58ac28464c7479351f880a7a",
//         "5de50f704c74791c94091ed9",
//         "56cd8aac75fe2461e0871aad",
//         "5de50f2a4c74791c94091ed8",
//         "5de510a14c74791c94091ef6",
//         "56e13d2e75fe2450755e553a",
//         "5b10049f4c747908b2b4f278"
//     ],
//     "groups": [],
//     "notifications": [],
//     "favorites": [],
//     "editables": [],
//     "myCollections": [],
//     "mySharedCollections": [],
//     "myExhibitions": [],
//     "mySharedExhibitions": [],
//     "count": {
//         "annotations": 0,
//         "myCollections": 6,
//         "myExhibitions": 0,
//         "mySharedCollections": 0,
//         "mySharedExhibitions": 0,
//         "myFavorites": 0,
//         "myPendingNotifications": 0,
//         "myOrganizations": 8,
//         "myProjects": 7,
//         "myGroups": 15,
//         "campaigns": 16
//     }
// }; }

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
    console.log(this.collection, this.collection.description[0])
    //route.navModel.setTitle(this.collection.title[0]+' | '+settings.project);
    route.navModel.setTitle('Collection | '+this.collection.title[0]);
	}

}
