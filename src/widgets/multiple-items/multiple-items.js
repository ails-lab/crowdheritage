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

	get isAuthenticated() { return this.userServices.isAuthenticated(); }
	get user() { return this.userServices.current; }

  constructor(collectionServices, userServices, recordServices) {
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
    this.currentCount = 0;
    this.loading = false;
    this.more = true;
    this.count = 20;
	}

	async getCollectionRecords(offset, count) {
		this.loading = true;
		let response = await this.collectionServices.getRecords(this.collection.dbId, offset, count);
		this.currentCount = this.currentCount + count;
		for (let i in response.records) {
			let recordData = response.records[i];
			if (recordData !== null) {
				this.records.push(new Record(recordData));
			}
		}
		this.loading = false;
	}

	async activate(params, route) {
		this.resetInstance();
	 	this.cname = params.cname;
	 	this.gname = params.gname;
		this.router = params.router;
	 	if (params.collection) {
	 		this.collection = params.collection;
		} else if (params.colid) {
			this.collectionId = params.colid;
		 	let collectionData = await this.collectionServices.getCollection(this.collectionId);
		 	this.collection = new Collection(collectionData);
		}
		if (this.collection) {
			await this.getCollectionRecords(0, 20);
		}
	}

  goToItem(record) {
    let item = this.router.routes.find(x => x.name === 'item');
    item.campaign = this.campaign;
    item.offset = this.records.indexOf(record);
		//TODO pass the subarray of items as well
    item.collection= this.collection;
		item.records = [];
		this.router.navigateToRoute('item', {cname: this.cname, gname: this.gname, recid: this.records[item.offset].dbId});
  }

  async loadMore() {
		if (this.collection) {
    	await this.getCollectionRecords(this.currentCount, this.count);
		}
  }

}
