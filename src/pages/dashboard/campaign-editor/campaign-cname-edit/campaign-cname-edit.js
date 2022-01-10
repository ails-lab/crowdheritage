import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Collection } from 'Collection.js';
import { MediaServices } from 'MediaServices.js';
import { CollectionServices } from 'CollectionServices.js';
import { Campaign } from 'Campaign.js';
import { CampaignServices } from 'CampaignServices.js';
import { UserServices } from 'UserServices';
import { I18N } from 'aurelia-i18n';
//import settings from 'global.config.js';

let instance = null;

@inject(CollectionServices, MediaServices, CampaignServices, UserServices, Router, I18N)
export class CampaignCnameEdit {

  constructor(collectionServices, mediaServices, campaignServices, userServices, router, i18n) {
    if (instance) {
      return instance;
    }
    this.campaignServices = campaignServices;
    this.userServices = userServices;
    this.mediaServices = mediaServices;
    this.router = router;
    this.i18n = i18n;

    this.loc;
    this.locales = [
      { title: "English", code: "en", flag: "/img/assets/images/flags/en.png" },
      { title: "Italiano", code: "it", flag: "/img/assets/images/flags/it.png" },
      { title: "Français", code: "fr", flag: "/img/assets/images/flags/fr.png" }
      //{ title: "Ελληνικά",    code: "el", flag: "/img/assets/images/flags/el.png" },
      //{ title: "Deutsch",     code: "de", flag: "/img/assets/images/flags/de.png" },
      //{ title: "Español",     code: "es", flag: "/img/assets/images/flags/es.png" },
      //{ title: "Nederlands",  code: "nl", flag: "/img/assets/images/flags/nl.png" },
      //{ title: "Polszczyzna", code: "pl", flag: "/img/assets/images/flags/pl.png" }
    ];
    this.currentLocale = this.locales[0]; // default language for form language picker
    this.currentLocaleCode = "en"; // default language for form language picker

    // Initialization
    this.prizes = ['gold', 'silver', 'bronze', 'rookie']
    this.errors = {};

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
    console.log(params);

    this.cname = params.cname;
    let campaignData = await this.campaignServices.getCampaignByName(this.cname);
    this.campaign = new Campaign(campaignData);
    //route.navModel.setTitle(this.campaign.title[0]+' | '+settings.project);
    console.log(this.campaign)
    route.navModel.setTitle('Campaign | ' + this.campaign.title);

  }

  loadFromFile() {
    $('#banner').trigger('click');
  }

  uploadBanner = () => {
    let input = document.getElementById('banner');
    let data = new FormData();
    data.append('file', input.files[0]);

    this.mediaServices.upload(data).then((response) => {
      // this.banner = MediaServices.toObject(response.Medium);
      // TODO: Remove hardcoded URL? campaign.banner seems to be a string like the one below.
      this.campaign.banner = `https://api.crowdheritage.eu${response.medium}`
      // Show the cancel/save buttons
      $('.button-group').removeClass('hiddenfile');
    }).catch((error) => {
      logger.error(error);
      toastr.danger('Error uploading the file!');
    });
  }

  toggleLangMenu() {
    if ($('#campaign-lang').hasClass('open')) {
      $('#campaign-lang').removeClass('open');
    }
    else {
      $('#campaign-lang').addClass('open');
    }
  }

  changeLang(loc) {
    this.currentLocale = loc
    console.log(this.campaign);
  }

}
