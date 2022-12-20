import { inject, LogManager, NewInstance } from 'aurelia-framework';
import { UserServices } from 'UserServices';

import { I18N } from 'aurelia-i18n';
let logger = LogManager.getLogger('CampaignEditor.js');

let COUNT = 9;

@inject(UserServices, I18N)
export class DataExport {
  constructor(userServices, i18n) {
    this.loc = window.location.href.split('/')[3];
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
  }
}
