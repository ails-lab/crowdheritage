import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Collection } from 'Collection.js';
import { CollectionServices } from 'CollectionServices.js';
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
        value: this.i18n.tr('dashboard:privateCollection'),
        bool: false
      },
      {
        value: this.i18n.tr('dashboard:publicCollection'),
        bool: true
      }
    ];
    this.locales = [
      { title: "English", code: "en", flag: "/img/assets/images/flags/en.png" },
      { title: "Italiano", code: "it", flag: "/img/assets/images/flags/it.png" },
      { title: "Français", code: "fr", flag: "/img/assets/images/flags/fr.png" },
      { title: "Español", code: "es", flag: "/img/assets/images/flags/es.png" },
      { title: "Polszczyzna", code: "pl", flag: "/img/assets/images/flags/pl.png" }
      //{ title: "Ελληνικά",    code: "el", flag: "/img/assets/images/flags/el.png" },
      //{ title: "Deutsch",     code: "de", flag: "/img/assets/images/flags/de.png" },
      //{ title: "Nederlands",  code: "nl", flag: "/img/assets/images/flags/nl.png" },
    ];
    this.currentLocale;
    this.currentLocaleCode;
    this.selectedAccess = false;
    this.title = {};
    this.desc = {};
    this.originalTitle = null;
    this.originalDescription = null;
  }

  resetInstance() {
    this.selectedAccess = false;
    this.title = this.originalTitle ? this.originalTitle : {};
    this.desc = this.originalDescription ? this.originalDescription : {};
  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }
  get user() { return this.userServices.current; }

  async activate(params, route) {
    this.edit = params.type === 'edit' ? true : false;
    this.loc = 'en';
    this.getLocale();
    if (params.collection) {
      this.originalTitle = Object.assign({}, params.collection.title);
      this.originalDescription = Object.assign({}, params.collection.description);

      this.selectedAccess = params.collection.isPublic;
      this.title = Object.assign({}, params.collection.title);
      this.title[this.loc] = this.title[this.loc] ? this.title[this.loc][0] : (this.title.default ? this.title.default[0] : this.title)
      this.desc = Object.assign({}, params.collection.description);
      this.desc[this.loc] = this.desc[this.loc] ? this.desc[this.loc][0] : (this.desc.default ? this.desc.default[0] : this.desc)
      for (let locale of this.locales) {
        if (locale.code !== 'en') {
          this.title[locale.code] = this.title[locale.code] ? this.title[locale.code][0] : ""
          this.desc[locale.code] = this.desc[locale.code] ? this.desc[locale.code][0] : ""
        }
      }
    }
    else {
      this.originalTitle = null;
      this.originalDescription = null;

      this.selectedAccess = false
      for (let locale of this.locales) {
        this.title[locale.code] = ""
        this.desc[locale.code] = ""
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
  }
}
