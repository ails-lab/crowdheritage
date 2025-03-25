import { inject } from "aurelia-framework";
import { Collection } from "Collection.js";
import { CollectionServices } from "CollectionServices.js";
import { I18N } from "aurelia-i18n";
//import settings from 'global.config.js';

let instance = null;

@inject(CollectionServices, I18N, "pageLocales")
export class Newcollection {
  constructor(collectionServices, i18n, pageLocales) {
    if (instance) {
      return instance;
    }
    this.collectionServices = collectionServices;
    this.i18n = i18n;
    this.importMethod = "";
    this.loc = window.location.href.split("/")[3];
    this.resourceType = "collection";
    if (!instance) {
      instance = this;
    }
    this.access = [
      {
        value: this.i18n.tr("dashboard:privateCollection"),
        bool: false,
      },
      {
        value: this.i18n.tr("dashboard:publicCollection"),
        bool: true,
      },
    ];
    this.locales = pageLocales();
    this.currentLocale;
    this.currentLocaleCode;
    this.selectedAccess = false;
    this.title = {};
    this.desc = {};
    this.originalTitle = null;
    this.originalDescription = null;
  }

  resetInstance() {
    this.currentLocale = this.locales[0];
    this.currentLocaleCode = this.currentLocale.code;
    this.localeFlagPath = this.currentLocale.flag;
    this.selectedAccess = false;
    this.title = this.originalTitle ? this.originalTitle : {};
    this.desc = this.originalDescription ? this.originalDescription : {};
  }

  get isAuthenticated() {
    return this.userServices.isAuthenticated();
  }
  get user() {
    return this.userServices.current;
  }

  async fetchCollection(id) {
    try {
      return await this.collectionServices.getCollection(id, false);
    } catch (err) {
      console.error(err);
    }
  }

  async activate(params, route) {
    this.edit = params.type === "edit" ? true : false;
    this.loc = "en";
    this.getLocale();
    if (params.collectionId) {
      const fetchedCollection = await this.fetchCollection(params.collectionId);

      this.collection = new Collection(fetchedCollection);

      this.originalTitle = Object.assign({}, this.collection.title);
      this.originalDescription = Object.assign({}, this.collection.description);

      this.selectedAccess = this.collection.isPublic;
      this.title = Object.assign({}, this.collection.title);
      this.title[this.loc] = this.title[this.loc]
        ? this.title[this.loc][0]
        : this.title.default
        ? this.title.default[0]
        : this.title;
      this.desc = Object.assign({}, this.collection.description);
      this.desc[this.loc] = this.desc[this.loc]
        ? this.desc[this.loc][0]
        : this.desc.default
        ? this.desc.default[0]
        : this.desc;
      for (let locale of this.locales) {
        if (locale.code !== "en") {
          this.title[locale.code] = this.title[locale.code]
            ? this.title[locale.code][0]
            : "";
          this.desc[locale.code] = this.desc[locale.code]
            ? this.desc[locale.code][0]
            : "";
        }
      }
    } else {
      this.originalTitle = null;
      this.originalDescription = null;

      this.selectedAccess = false;
      for (let locale of this.locales) {
        this.title[locale.code] = "";
        this.desc[locale.code] = "";
      }
    }
  }

  getLocale() {
    this.currentLocaleCode = this.loc;
    for (let loc of this.locales) {
      if (loc.code == this.currentLocaleCode) {
        this.currentLocale = loc;
        this.localeFlagPath = this.currentLocale.flag;

        return this.currentLocale;
      }
    }
  }

  toggleLangMenu() {
    if ($(".lang-collection").hasClass("open")) {
      $(".lang-collection").removeClass("open");
    } else {
      $(".lang-collection").addClass("open");
    }
  }

  changeLang(loc) {
    this.loc = loc;
    this.getLocale();
  }
}
