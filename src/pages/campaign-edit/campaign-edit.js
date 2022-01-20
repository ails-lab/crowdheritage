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

@inject(CollectionServices, MediaServices, CampaignServices, UserServices, Router, I18N, 'pageLocales')
export class CampaignEdit {

  constructor(collectionServices, mediaServices, campaignServices, userServices, router, i18n, pageLocales) {
    if (instance) {
      return instance;
    }
    this.campaignServices = campaignServices;
    this.userServices = userServices;
    this.mediaServices = mediaServices;
    this.router = router;
    this.i18n = i18n;

    this.loc;
    this.locales = pageLocales();
    this.currentLocale = this.locales[0]; // default language for form language picker

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
    this.cname = params.cname;
    let campaignData = await this.campaignServices.getCampaignByName(this.cname);
    this.campaign = new Campaign(campaignData, this.loc);

    let title = this.campaign.title ? this.campaign.title : this.campaign.username;
    route.navModel.setTitle('Edit Campaign | ' + title);
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
    if ($('.lang-collection').hasClass('open')) {
      $('.lang-collection').removeClass('open');
    }
    else {
      $('.lang-collection').addClass('open');
    }
  }

  changeLang(index) {
    this.currentLocale = this.locales[index];
  }

  goBackToDashboard() {
    this.router.navigateToRoute('dashboard', {lang: this.loc, resource: 'campaigns'});
  }

  previewCampaign() {
    this.router.navigateToRoute('summary', {lang: this.loc, cname: this.cname});
  }

  deleteCampaign() {
    if (window.confirm(this.i18n.tr('dashboard:deleteCampaignMessage'))) {
      this.campaignServices.deleteCampaign(this.campaign.dbId)
        .then(() => {
          this.goBackToDashboard();
        })
        .catch(error => console.error(error));
    }
  }

  updateCampaign() {
    console.log(this.campaign);
  }

}
