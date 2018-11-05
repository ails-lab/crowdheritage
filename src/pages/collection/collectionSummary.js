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
import { Router } from 'aurelia-router';
import { Collection } from 'Collection.js';
import { CollectionServices } from 'CollectionServices.js';
import { UserServices } from 'UserServices';

let instance = null;

@inject(CollectionServices, UserServices, Router)
export class CollectionSummary {

  constructor(collectionServices, userServices, router) {
		if (instance) {
			return instance;
		}
	  this.collectionServices = collectionServices;
	  this.userServices = userServices;
	  this.router = router;
	  if (!instance) {
			instance = this;
		}
  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }
	get user() { return this.userServices.current; }

  attached() {
	  $('.accountmenu').removeClass('active');
	}

	async activate(params, route) {
		this.cname = params.cname;
		this.gname = params.gname;
		this.collectionId = params.colid;
		let collectionData = await this.collectionServices.getCollection(this.collectionId);
		this.collection = new Collection(collectionData);
	}

}
