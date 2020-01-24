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
import fetchConfig from 'fetch.config.js';
import { checkStatus } from 'fetch.config.js';
import settings from 'global.config.js';

@inject(HttpClient)
export class AnnotationServices {

	constructor(http) {
		http.configure(fetchConfig);
		this.http = http;

		this.annotators = [];
		this.vocabularies = [];
		this.vocabularyIndex = [];

		let self = this;
		this.getAnnotators().then(data => {
			for (let i in data) {
				self.annotators.push(data[i]);
				self.annotators[i].id = 'annotategroup' + i;
				self.annotators[i].hrefid = '#annotategroup' + i;
				self.annotators[i].cid = 'cannotategroup' + i;
				self.annotators[i].chrefid = '#cannotategroup' + i;
				self.annotators[i].order = i;
			}
		});
		this.getVocabularies().then(data => {
			for (let i in data) {
				self.vocabularies.push(data[i]);
				self.vocabularyIndex[data[i].name] = data[i];
			}
		});
	}

	getVocabularyLabel(code) {
		if (this.vocabularyIndex[code] != null) {
			return this.vocabularyIndex[code].label;
		} else {
			return 'Unknown';
		}
	}

	delete(id) {
		return this.http.fetch(`/annotation/${id}`, {
			method: 'DELETE'
		}).then(checkStatus);
	}

	approve(id) {
		return this.http.fetch(`/annotation/${id}/approve`, {
			method: 'GET'
		}).then(checkStatus);
	}

	approveObj(id, camp) {
		let annotation = { generator: settings.project+' '+camp, generated: new Date().toISOString(), created: new Date().toISOString(), confidence: 0.0 };

		return this.http.fetch(`/annotation/${id}/approveObj`, {
			method: 'POST',
			body: JSON.stringify(annotation),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(response => annotation);
	}

	getAnnotation(id) {
		return this.http.fetch(`/annotation/${id}`, {
        method: 'GET'
      }).then(checkStatus).then((response) => {
		return response.json();
      });
	}

	reject(id) {
		return this.http.fetch(`/annotation/${id}/reject`, {
			method: 'GET'
		}).then(checkStatus);
	}

	rejectObj(id, camp) {
		let annotation = { generator: settings.project+' '+camp, generated: new Date().toISOString(), created: new Date().toISOString(), confidence: 0.0 };

		return this.http.fetch(`/annotation/${id}/rejectObj`, {
			method: 'POST',
			body: JSON.stringify(annotation),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(response => annotation);
	}

	unscore(id) {
		return this.http.fetch(`/annotation/${id}/unscore`, {
			method: 'GET'
		}).then(checkStatus);
	}

	unscoreObj(id) {
		return this.http.fetch(`/annotation/${id}/unscoreObj`, {
			method: 'GET'
		}).then(checkStatus);
	}

	approveMultiple(idArray) {
		let idstr = '';
		for (let i = 0; i < idArray.length; i++) {
			if (idstr.length > 0) {
				idstr += '&';
			}

			idstr += 'id=' + idArray[i];
		}
		return this.http.fetch('/annotation/approveMultiple?' + idstr, {
			method: 'GET'
		}).then(checkStatus);
	}

	rejectMultiple(idArray) {
		let idstr = '';
		for (let i = 0; i < idArray.length; i++) {
			if (idstr.length > 0) {
				idstr += '&';
			}

			idstr += 'id=' + idArray[i];
		}
		return this.http.fetch('/annotation/rejectMultiple?' + idstr, {
			method: 'GET'
		}).then(checkStatus);
	}

	unscoreMultiple(idArray) {
		let idstr = '';
		for (let i = 0; i < idArray.length; i++) {
			if (idstr.length > 0) {
				idstr += '&';
			}

			idstr += 'id=' + idArray[i];
		}
		return this.http.fetch('/annotation/unscoreMultiple?' + idstr, {
			method: 'GET'
		}).then(checkStatus);
	}

	getAnnotators() {
		return this.http.fetch('/thesaurus/listAnnotators', {
			method: 'GET'
		}).then(checkStatus).then((response) => {
			return response.json();
		});
	}

	getVocabularies() {
		return this.http.fetch('/thesaurus/listVocabularies', {
			method: 'GET'
		}).then(checkStatus).then((response) => {
			return response.json();
		});
	}

	autoAnnotateCollection(colid, vocs) {
		return this.http.fetch(`/collection/${colid}/annotate`, {
			method: 'POST',
			body: JSON.stringify(vocs),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(checkStatus).then((response) => {
			response.json();
		});
	}

	autoAnnotateRecord(recid, vocs) {
		return this.http.fetch(`/record/${recid}/annotate`, {
			method: 'POST',
			body: JSON.stringify(vocs),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(checkStatus).then((response) => {
			response.json();
		});
	}

	async annotateRecord(recid, term, camp, mot) {
		let body = {uri: term.uri, uriVocabulary: term.vocabulary, label: { default: [ term.label ], en: [term.label ] } };
		if (typeof term.labels !== 'undefined') {
		 	body.label = term.labels;
			body.label.default = [ term.label ];
		}
		let target = { recordId: recid};
		let annotation = { generator: settings.project+' '+camp, generated: new Date().toISOString(), confidence: 0.0, motivation: mot, body: body, target: target };

		return this.http.fetch('/record/annotation', {
			method: 'POST',
			body: JSON.stringify(annotation),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(checkStatus).then((response) => {
			response.json();
		});
	}


	async annotateGeoRecord(recid, geoid, camp) {
		let body = {uri: geoid };
		let target = { recordId: recid};
		let annotation = { generator: settings.project+' '+camp, generated: new Date().toISOString(), confidence: 0.0, motivation: 'GeoTagging', body: body, target: target };

		return this.http.fetch('/record/annotation', {
			method: 'POST',
			body: JSON.stringify(annotation),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(checkStatus).then((response) => {
			response.json();
		});
	}



	annotateCollection(colid, term) {
		let body = {uri: term.uri, uriVocabulary: term.vocabulary, label: { default: [ term.label ], en: [term.label ] } };
		let annotation = { generator: 'WITH Manual Annotator', generated: new Date().toISOString(), confidence: 0.0, motivation: 'Tagging', body: body };

		return this.http.fetch(`/collection/${colid}/annotation`, {
			method: 'POST',
			body: JSON.stringify(annotation),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(checkStatus).then((response) => {
			response.json();
		});
	}

	geoAnnotateRecord(recid, lon, lat) {
		let body = { coordinates: {longitude: lon, latitude: lat }};
		let target = { recordId: recid};
		let annotation = { generator: 'WITH Geo Annotator', generated: new Date().toISOString(), motivation: 'GeoTagging', body: body, target: target };

		return this.http.fetch('/record/annotation', {
			method: 'POST',
			body: JSON.stringify(annotation),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(checkStatus).then((response) => {
			response.json();
		});
	}

	deleteRejectedAnnotations(recid) {
		return this.http.fetch(`/record/${recid}/deleteRejectedAnnotations`, {
			method: 'GET'
		}).then(checkStatus).then((response) => {
			response.json();
		});
	}

	annotationGroupModes() {
		return [ {mode: 0, label: 'All', id: 'grouping-0'}, {mode: 1, label: 'Vocabulary', id: 'grouping-1'}, {mode: 2, label: 'Annotator', id: 'grouping-2'}];
	}

}
