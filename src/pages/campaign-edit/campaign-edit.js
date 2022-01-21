import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Collection } from 'Collection.js';
import { MediaServices } from 'MediaServices.js';
import { CollectionServices } from 'CollectionServices.js';
import { Campaign } from 'Campaign.js';
import { CampaignServices } from 'CampaignServices.js';
import { ThesaurusServices } from 'ThesaurusServices.js';
import { UserServices } from 'UserServices';
import { I18N } from 'aurelia-i18n';
import settings from 'global.config.js';

let instance = null;

@inject(CollectionServices, MediaServices, CampaignServices, UserServices, ThesaurusServices, Router, I18N, 'pageLocales')
export class CampaignEdit {

  constructor(collectionServices, mediaServices, campaignServices, userServices, thesaurusServices, router, i18n, pageLocales) {
    this.DEFAULT_BANNER = 'http://withculture.eu/assets/img/content/background-space.png';
    if (instance) {
      return instance;
    }
    this.campaignServices = campaignServices;
    this.userServices = userServices;
    this.thesaurusServices = thesaurusServices;
    this.mediaServices = mediaServices;
    this.router = router;
    this.i18n = i18n;

    this.loc;
    this.locales = pageLocales();
    this.currentLocale = this.locales[0]; // default language for form language picker

    // Initialization
    this.prizes = ['gold', 'silver', 'bronze', 'rookie'];
    this.motivations = ['Tagging', 'GeoTagging', 'ColorTagging', 'Commenting'];
    this.motivationValues = {Tagging: false, GeoTagging: false, ColorTagging: false, Commenting: false};
    this.availableVocabularies = [];
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

    this.campaign.startDate = this.campaign.startDate.replaceAll('/','-');
    this.campaign.endDate = this.campaign.endDate.replaceAll('/','-');
    if (this.campaign.motivation) {
      for (let mot of this.campaign.motivation) {
        this.motivationValues[mot] = true;
      }
    }
    this.thesaurusServices.listVocabularies()
      .then(response => {
        this.availableVocabularies = response;
      });

    let title = this.campaign.title ? this.campaign.title : this.campaign.username;
    route.navModel.setTitle('Edit Campaign | ' + title);
  }

  displayImage(img) {
    return (!img.startsWith('http')) ? `${settings.baseUrl}${img}` : img;
  }

  loadFromFile(id) {
    $(id).trigger('click');
  }

  uploadBanner = () => {
    let input = document.getElementById('bannerFile');
    let data = new FormData();
    data.append('file', input.files[0]);

    this.mediaServices.upload(data).then((response) => {
      this.campaign.banner = this.displayImage(response.original);
    }).catch((error) => {
      logger.error(error);
      toastr.danger('Error uploading the file!');
    });
  }

  removeBanner() {
    this.campaign.banner = this.DEFAULT_BANNER;
  }

  uploadLogo = () => {
    let input = document.getElementById('logoFile');
    let data = new FormData();
    data.append('file', input.files[0]);

    this.mediaServices.upload(data).then((response) => {
      this.campaign.logo = this.displayImage(response.original);
    }).catch((error) => {
      logger.error(error);
      toastr.danger('Error uploading the file!');
    });
  }

  removeLogo() {
    this.campaign.logo = null;
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
    window.open(this.router.generate('summary', {lang: this.loc, cname: this.cname}));
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
    // TODO: Use correct API call to update campaign details. Add form validation.
    let obj = {
      username: this.campaign.username,
      title: this.campaign.titleObject,
      description: this.campaign.descriptionObject,
      instructions: this.campaign.instructionsObject,
      banner: this.campaign.banner.split(settings.baseUrl)[1],
      logo: this.campaign.logo.split(settings.baseUrl)[1],
      disclaimer: this.campaign.disclaimerObject,
      isPublic: this.campaign.isPublic,
      motivation: Object.keys(this.motivationValues).filter(mot => this.motivationValues[mot]),
      prizes: this.campaign.prizesObject,
      annotationTarget: this.campaign.target,
      // vocabularies: ,
      startDate: this.campaign.startDate.replaceAll('-','/'),
      endDate: this.campaign.endDate.replaceAll('-','/'),
      // creators: ,
      // userGroupIds: ,
      // targetCollections:
    };
    console.log(obj);
  }

}
