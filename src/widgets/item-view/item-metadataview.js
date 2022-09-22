import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { I18N } from 'aurelia-i18n';
import { UserServices } from 'UserServices';
import { RecordServices } from 'RecordServices';
import { Record } from 'Record.js';
import { Campaign } from 'Campaign.js';

@inject(Router, I18N, UserServices, RecordServices)
export class ItemMetadataView {
  constructor(router, i18n, userServices, recordServices) {
    this.router = router;
    this.i18n = i18n;
    this.userServices = userServices;
    this.recordServices = recordServices;

    this.campaign = null;
    this.record = null;
    this.mediaDiv = '';

    this.previous = null;
    this.recId = '';
    this.loc = '';
  }

  activate(params) {
    this.loc = params.lang;
    this.campaign = params.campaign;
    this.record = params.record;
    this.mediaDiv = params.mediaDiv;
    this.collectionTitle = params.collectionTitle;

    this.recId = this.record.dbId;
  }
}
