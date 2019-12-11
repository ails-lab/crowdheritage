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
import { HttpClient } from 'aurelia-fetch-client';
import { UserServices } from 'UserServices.js';
import fetchConfig from 'fetch.config.js';
import { checkStatus } from 'fetch.config.js';

import 'isomorphic-fetch';

@inject(HttpClient, UserServices)
export class RecordServices {

	constructor(http, userServices) {
		http.configure(fetchConfig);
		this.http = http;
		this.userServices = userServices;
	}

	// Record retrieval
	getRecord(id) {
		return this.http.fetch('/record/' + id, {
			method: 'GET'
		}).then(checkStatus).then((response) => {
			return response.json();
		});
	}

	getSimilarRecords(term, source) {
		return this.http.fetch('/api/advancedsearch', {
			method: 'POST',
			body: JSON.stringify({searchTerm: term,
				page: 1,
				pageSize: 20,
			    source: source ? [source] : [],
			    filters: []
			}),
			headers: {
				'Content-Type': 'application/json'
				// More options
			}
		}).then(checkStatus).then((response) => {
			return response.json();
		});
	}

	getMultipleRecords(idArray) {
		let idstr = '';
		for (let i = 0; i < idArray.length; i++) {
			if (idstr.length > 0) {
				idstr += '&';
			}

			idstr += 'id=' + idArray[i];
		}
		return this.http.fetch('/record/multiple?' + idstr, {
			method: 'GET'
		}).then(checkStatus).then((response) => {
			return response.json();
		});
	}

	getAnnotatedRecordsByLabel(label, generators) {
		let gens = '';
		for (let gen of generators) {
			if (gens.length > 0) {
				gens += '&';
			}
			gens += 'generator=' + gen;
		}
		return this.http.fetch('/record/annotationLabel?label=' + label + "&" + gens, {
			method: 'GET'
		}).then(checkStatus).then((response) => {
			return response.json();
		});
	}

	// request random records from given group id
	getRandomRecords( groupId, batchCount ) {
		return this.http.fetch('/record/randomRecords?groupId=' + groupId + '&batchCount=' + batchCount, {
			method: 'GET'
		}).then(checkStatus).then((response) => {
			return response.json();
		});
	}

	// request annotated records from given group id
	// minimum number of annotations, backend supports 1-3
	getRandomAnnotatedRecords( groupId, count, minimum ) {
		return this.http.fetch('/record/randomAnnotatedRecords?groupId=' + groupId + '&count=' + count +'&minimum=' + minimum, {
			method: 'GET'
		}).then(checkStatus).then((response) => {
			return response.json();
		});
	}

	// collectionids is an array of objectids strings
	// count is how many you want
	getRandomRecordsFromCollections( collectionIds, count, hideMine='hide') {
		var collectionList = collectionIds.join(",");

		return this.http.fetch('/record/randomRecordsFromCollections?collectionIds=' + collectionList + '&count=' + count + '&hideMyAnnotated=' + (hideMine === 'hide'), {
			method: 'GET'
		}).then(checkStatus).then((response) => {
			return response.json();
		});
	}

	getAnnotations(id, motivation) {
		return this.http.fetch(`/record/${id}/listAnnotations?motivation=${motivation}`, {
			method: 'GET'
		}).then(checkStatus).then((response) => {
			return response.json();
		});
	}

	isLiked(id) {
		if (!this.userServices.isAuthenticated()) return false;

		if (id && this.userServices.current.favorites) {
			return this.userServices.current.favorites.indexOf(id) !== -1 ? true : false;
		}

		return false;
	}

	like(record) {
		return this.http.fetch('/collection/liked', {
			method: 'POST',
			body: JSON.stringify(record),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then((response) => {
			return response.json();
		});
	}

	unlike(id) {
		return this.http.fetch('/collection/unliked', {
			method: 'POST',
			body: JSON.stringify({externalId: id}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then((response) => {
			return response.json();
		});
	}

	updateExhibitionRecord(record, colId) {
		return this.http.fetch('/record/contextData?collectionId=' + colId, {
			method: 'POST',
			body: JSON.stringify(record),
			headers: {
				'Content-Type': 'application/json'
				// More options
			}
		}).then((response)  => {
			return response.json();
		});
	}

	updateContextData(data, colId) {
		console.log(JSON.stringify(data));
		return this.http.fetch('/record/contextData?collectionId=' + colId, {
			method: 'PUT',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json'
				// More options
			}
		}).then(checkStatus);
	}
}
