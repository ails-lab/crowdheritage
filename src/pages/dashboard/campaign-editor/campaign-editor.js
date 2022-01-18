import { inject, LogManager, NewInstance } from 'aurelia-framework';
import { Campaign } from 'Campaign.js';
import { CampaignServices } from 'CampaignServices.js';
import { UserServices } from 'UserServices';
import { I18N } from 'aurelia-i18n';
let logger = LogManager.getLogger('CampaignEditor.js');

let COUNT = 9;

@inject(CampaignServices, UserServices, I18N)
export class CampaignEditor {
  constructor(campaignServices, userServices, i18n) {
    this.loc = window.location.href.split('/')[3];
    this.campaignServices = campaignServices;
    this.userServices = userServices;
    this.i18n = i18n;
    this.more = true;
    this.campaigns = [];
    this.loading = false;
    this.campaignsCount = 0;
    this.currentCount = 0;
    this.campaignUsername = '';
  }

  get user() { return this.userServices.current; }

  async activate(params, route) {
    if (this.i18n.getLocale() != this.loc) {
      this.i18n.setLocale(this.locale);
    }
    this.getCampaigns();
  }

  getCampaigns() {
    this.campaigns = [];

    this.loading = true;
    this.campaignServices.getUserCampaigns(0, COUNT)
      .then(response => {
        if (response === 0) {
          this.campaignsCount = 0;
        }
        if (this.loading) {
          this.campaignsCount = response.count;
          this.fillCampaignArray(response.campaigns);
          this.currentCount = this.currentCount + response.campaigns.length;
          this.more = (this.currentCount >= this.campaignsCount) ? false : true;
          this.loading = false;
        }
      });
  }

  loadMore() {
    this.loading = true;
    this.campaignServices.getUserCampaigns(this.currentCount, COUNT)
      .then(response => {
        this.fillCampaignArray(response.campaigns);
        this.currentCount = this.currentCount + response.campaigns.length;
        this.more = (this.currentCount >= this.campaignsCount) ? false : true;
        this.loading = false;
      });
  }

  fillCampaignArray(results) {
    for (let item of results) {
      // Based on the selected language, set the campaign
      let camp = new Campaign(item, this.loc);
      this.campaigns.push(camp);
    }
  }

  toggleImportMenu() {
    if ($('.import-wrap').hasClass('open')) {
      $('.import-wrap').removeClass('open');
    }
    else {
      $('.import-wrap').addClass('open');
    }
  }

  closeNav() {
    document.getElementById("editSidebar").style.width = "0";
    document.getElementById("editSidebar").style.boxShadow = "none";
    this.campaignUsername = "";
  }

  createCampaignSidebar() {
    document.getElementById("editSidebar").style.width = "450px";
    document.getElementById("editSidebar").style.boxShadow = "0px 0px 10px 0px rgba(0,0,0,.6)";
  }

  createCampaign() {
    if (!this.campaignUsername || this.campaignUsername.length == 0) {
      toastr.error(this.i18n.tr('dashboard:emptyUsernameError'));
      return;
    }
    else if (this.campaignUsername.includes(' ')) {
      toastr.error(this.i18n.tr('dashboard:invalidUsernameError'));
      return;
    }

    this.campaignServices.createEmptyCampaign(this.campaignUsername)
      .then(response => {
        if (response.status !== 200) {
          if (response.statusText) {
            throw new Error(response.statusText);
          } else if (response.error) {
            throw new Error(response.error);
          }
        }

        toastr.success(this.i18n.tr('dashboard:campaignSuccessMessage'));
        this.closeNav();
        this.getCampaigns();
      })
      .catch(error => toastr.error(error.message));
  }
}
