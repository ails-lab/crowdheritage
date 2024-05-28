import { inject } from 'aurelia-framework';
import { I18N } from 'aurelia-i18n';

@inject(I18N)
export class CampaignCreation {

  constructor(i18n) {
    this.i18n = i18n;
    this.loc;
  }

  activate(params) {
    this.loc = params.lang;
    this.i18n.setLocale(params.lang);
  }

  attached() {
    $('.accountmenu').removeClass('active');
  }
}
