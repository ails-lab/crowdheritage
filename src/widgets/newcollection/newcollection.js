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
    this.loc = window.location.href.split('/')[3];
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
    this.locales = [
      { title: "English",     code: "en", flag: "/img/assets/images/flags/en.png" },
      { title: "Italiano",    code: "it", flag: "/img/assets/images/flags/it.png" },
      { title: "Français",    code: "fr", flag: "/img/assets/images/flags/fr.png" }
      //{ title: "Ελληνικά",    code: "el", flag: "/img/assets/images/flags/el.png" },
      //{ title: "Deutsch",     code: "de", flag: "/img/assets/images/flags/de.png" },
      //{ title: "Español",     code: "es", flag: "/img/assets/images/flags/es.png" },
      //{ title: "Nederlands",  code: "nl", flag: "/img/assets/images/flags/nl.png" },
      //{ title: "Polszczyzna", code: "pl", flag: "/img/assets/images/flags/pl.png" }
    ];
    this.currentLocale;
    this.currentLocaleCode;
    this.selectedAccess = false;
    this.title = {};
    this.desc = {};
    this.collection = new Collection();
  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }
  get user() { return this.userServices.current; }

  attached() {
  }

  async activate(params, route) {
    this.edit = params.type === 'edit' ? true : false;
    this.loc = 'en';
    this.getLocale();
    if (params.collection) {
      this.collection = params.collection
      console.log(this.collection.title)
      this.selectedAccess = this.collection.isPublic;
      this.title = this.collection.title
      this.title[this.loc] = this.title[this.loc] ? this.title[this.loc] : this.title.default[0]
      this.desc = this.collection.description
      this.desc[this.loc] = this.desc[this.loc] ? this.desc[this.loc] : this.desc.default[0]
      // console.log(this.title, this.desc)

    }
    else {
      this.collection = new Collection()
      this.collection.isPublic = false
      this.selectedAccess = false
      this.title = {};
      this.desc = {}
      for (let locale of this.locales){
        this.title[locale] = ""
        this.desc[locale] = ""
      }
    }
  }

  getLocale() {
    this.currentLocaleCode = this.loc;
    for (let loc of this.locales) {
      if (loc.code == this.currentLocaleCode) {
        this.currentLocale = loc;
        this.localeFlagPath = this.currentLocale.flag
        
        return this.currentLocale;
      }
    }
    // If the language paremeter is not a valid one redirect to English home page
    // let index = this.router.routes.find(x => x.name === 'index');
    // this.router.navigateToRoute('index', {lang: 'en'});
  }

  toggleLangMenu() {
    if ($('.lang-collection').hasClass('open')) {
      $('.lang-collection').removeClass('open');
    }
    else {
      $('.lang-collection').addClass('open');
    }
  }

  changeLang(loc) {
    this.loc = loc
    this.getLocale()
    // let url = window.location.href.split('/');
    // if (url[3] === loc) {
    //   return;
    // }
    // else {
    //   url[3] = loc;
    //   window.location.href = url.join('/');
    // }
  }


  
}
