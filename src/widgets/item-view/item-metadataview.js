import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { I18N } from 'aurelia-i18n';
import { Annotation } from 'Annotation';
import { UserServices } from 'UserServices';
import { RecordServices } from 'RecordServices';
import settings from 'global.config.js';

@inject(Router, I18N, UserServices, RecordServices)
export class ItemMetadataView {
  constructor(router, i18n, userServices, recordServices) {
    this.router = router;
    this.i18n = i18n;
    this.userServices = userServices;
    this.recordServices = recordServices;

    this.collection = null;
    this.campaign = '';
    this.cname = '';
    this.record = null;
    this.mediaDiv = '';
    this.metadataMode = true;

    this.annotations = [];
    this.previous = null;
    this.recId = '';
    this.loc = '';
  }

  activate(params) {
    this.loc = params.lang;
    this.campaign = params.campaign;
    this.record = params.record;
    this.mediaDiv = params.mediaDiv;
    this.cname= this.campaign.username;
    this.recId = this.record.dbId;
    this.generator = `${settings.project} ${this.campaign.username}`;

    this.campaign.motivation.forEach(motivation => {
      this.recordServices.getAnnotations(this.recId, motivation, this.generator)
        .then(response => {
          for (let ann of response) {
            let user = this.userServices.current ? this.userServices.current.dbId : "";
            this.annotations.push(new Annotation(ann, user, "all", this.generator));
          }
        })
        .catch(error => console.error(error.message));
    });

  }

  quickView() {
    $('.action').removeClass('active');
    $('.action.itemview').addClass('active');
  }
}
