/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


import { inject } from 'aurelia-framework';
import { Collection } from 'Collection.js';
import { CollectionServices } from 'CollectionServices.js';
import { Record } from 'Record.js';
import { UserServices } from 'UserServices';
import { CampaignServices } from 'CampaignServices';
import { I18N } from 'aurelia-i18n';
import { EventAggregator } from 'aurelia-event-aggregator';
import settings from 'global.config.js';

let instance = null;

@inject(CollectionServices, UserServices, CampaignServices, I18N, EventAggregator)
export class MultipleItems {

  get smallerClass() { return this.collection ? '' : 'smaller' }
  get more() { return this.records.length < this.totalCount }
  get offset() { return this.records.length }
  get byUser() { return !!this.user }
  get byCollection() { return !!this.collection && !this.collectionEdit }
  get byCollectionEdit() { return this.collectionEdit }

  constructor(collectionServices, userServices, campaignServices, i18n, eventAggregator) {
    if (instance) {
      return instance;
    }
    this.collectionServices = collectionServices;
    this.userServices = userServices;
    this.campaignServices = campaignServices;
    this.i18n = i18n;
    this.ea = eventAggregator;
    this.loc;
    this.project = settings.project;
    this.collectionEdit = false;
    this.campaign = '';
    this.cname = '';
    this.state = "hide";
    this.resetInstance();
    if (!instance) {
      instance = this;
    }
  }

  resetInstance() {
    this.records = [];
    this.collection = null;
    this.user = null;
    this.campaign = '';
    this.cname = '';
    this.loading = false;
    this.totalCount = 0;
    this.count = 24;
    this.loc = window.location.href.split('/')[3];
  }

  fillRecordArray(records) {
    for (let i in records) {
      let recordData = records[i];
      if (recordData !== null) {
        this.records.push(new Record(recordData));
      }
    }
    this.loading = false;
  }

  async getRecords() {
    if (this.collection) {
      let response = await this.collectionServices.getRecords(this.collection.dbId, this.offset, this.count, this.state);
      this.totalCount = response.entryCount;
      this.fillRecordArray(response.records);
      this.loading = false;
    }
    else if (this.user) {
      this.userServices.getUserAnnotations(this.user.dbId, this.project, this.cname, this.offset, this.count)
        .then(response => {
          this.fillRecordArray(response.records);
          this.loading = false;
        });
    }
  }

  attached() {
    if (this.byCollection) {
      window.addEventListener('scroll', e => this.scrollAndLoadMore());
    }
  }

  detached() {
    this.record = null;
  }

  async activate(params, route) {
    this.resetInstance();
    this.hiddenCount = 0;
    this.loc = params.lang;
    this.i18n.setLocale(params.lang);
    this.cname = params.cname;
    this.router = params.router;
    if (params.collectionEdit) {
      this.state = "show";
      this.collectionEdit = params.collectionEdit
      this.collection = params.myCollection;
      this.totalCount = this.collection.entryCount;
    }
    else if (params.collection) {
      this.collection = params.collection;
      this.totalCount = this.collection.entryCount;
    }
    else if (params.user) {
      this.user = params.user;
      this.totalCount = params.totalCount;
    }

    if (params.records && this.records.length == 0) {
      this.loading = true;
      this.fillRecordArray(params.records);
      this.loading = false;
      return;
    }
    this.loading = true;
    this.getRecords();
  }

  goToItem(record) {
    let item = this.router.routes.find(x => x.name === 'item');
    item.campaign = this.campaign;
    item.offset = this.records.indexOf(record);
    //TODO pass the subarray of items as well
    item.collection = this.collection;
    item.records = [];
    item.hideOrShowMine = this.state;
    this.router.navigateToRoute('item', { cname: this.cname, recid: this.records[item.offset].dbId, lang: this.loc });
    this.record = null;
  }

  quickView(record) {
    this.record = record;
    $('.action').removeClass('active');
    $('.action.itemview').addClass('active');
  }

  toggleStateMenu() {
    if ($('.state').hasClass('open')) {
      $('.state').removeClass('open');
    }
    else {
      $('.state').addClass('open');
    }
  }

  reloadCollection(state) {
    if (state == this.state) {
      return;
    }
    else {
      this.state = state;
      this.records.splice(0, this.records.length);
      this.loading = true;
      this.getRecords();
    }
  }

  hasContributed(record) {
    let annotations = record.annotations;
    for (var i in annotations) {
      let annotators = annotations[i].annotators;
      for (var j in annotators) {
        if (annotators[j].withCreator == this.userServices.current.dbId) {
          return true;
        }
      }
      if (record.score && record.score.approvedBy) {
        for (var j in score.approvedBy) {
          if (score.approvedBy[j].withCreator == this.userServices.current.dbId) {
            return true;
          }
        }
      }
      if (record.score && record.score.rejectedBy) {
        for (var j in score.rejectedBy) {
          if (score.rejectedBy[j].withCreator == this.userServices.current.dbId) {
            return true;
          }
        }
      }
    }
    return false;
  }

  async loadMore() {
    this.loading = true;
    this.getRecords();
  }

  scrollAndLoadMore() {
    if (($("#recs").height() - window.scrollY < 900) && !this.loading && this.more) {
      this.loading = true;
      this.getRecords();
    }
  }

  deleteRecord(record) {
    if (window.confirm("Do you really want to delete this record from your collection?")) {
      this.collectionServices.removeRecord(record.dbId, this.collection.dbId)
        .then(() => {
          this.ea.publish('record-removed');
        })
        .catch(error => console.error(error));
    }
  }

}
