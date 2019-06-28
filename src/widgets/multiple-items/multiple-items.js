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

let instance = null;

@inject(CollectionServices, UserServices)
export class MultipleItems {

	get smallerClass() { return this.collection ? '' : 'smaller' }
	get more() { return this.records.length < this.totalCount }
	get offset() { return this.records.length }

  constructor(collectionServices, userServices) {
		if (instance) {
			return instance;
		}
    this.collectionServices = collectionServices;
    this.userServices = userServices;
		this.resetInstance();
    if (!instance) {
			instance = this;
		}
  }

	resetInstance() {
    this.records = [];
    this.collection = null;
		this.user = null;
    this.loading = false;
    this.totalCount = 0;
    this.count = 24;
	}

	fillRecordArray(records) {
		for (let i in records) {
			let recordData = records[i];
			if (recordData !== null) {
				this.records.push(new Record(recordData));
			}
		}
	}

	async getRecords() {
		this.loading = true;
		if (this.collection) {
			let response = await this.collectionServices.getRecords(this.collection.dbId, this.offset, this.count);
			this.fillRecordArray(response.records);
		} else if (this.user) {
			let response = await this.userServices.getUserAnnotations(this.user.dbId, this.offset, this.count);
			this.fillRecordArray(response.records);
		}
		this.loading = false;
	}

	async activate(params, route) {
		this.resetInstance();
	 	this.cname = params.cname;
		this.router = params.router;
	 	if (params.collection) {
	 		this.collection = params.collection;
			this.totalCount = this.collection.entryCount;
		} else if (params.user) {
			this.user = params.user;
			this.totalCount = params.totalCount;
		}
		if (params.records) {
			this.records = params.records;
			return;
		}
		this.getRecords();
	}

  goToItem(record) {
    let item = this.router.routes.find(x => x.name === 'item');
    item.campaign = this.campaign;
    item.offset = this.records.indexOf(record);
		//TODO pass the subarray of items as well
    item.collection= this.collection;
		item.records = [];
		this.router.navigateToRoute('item', {cname: this.cname, recid: this.records[item.offset].dbId});
  }

  async loadMore() {
		this.getRecords();
  }

	scrollAndLoadMore() {
		if (($("#recs").height() - window.scrollY < 600 ) && !this.loading )
	 		this.getRecords();
	}

	attached() {
		window.addEventListener('scroll', e => this.scrollAndLoadMore());
	}

}
