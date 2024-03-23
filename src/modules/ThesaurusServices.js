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


/* eslint-disable */
import { inject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';
import fetchConfig from 'fetch.config.js';
import { checkStatus, fetchConfigGeo, fetchConfigColor, reset } from 'fetch.config.js';

@inject(HttpClient)
export class ThesaurusServices {

  constructor(http) {
    http.configure(fetchConfig);
  	this.http = http;
  }

  // word is the prefix of the label you want to return
  // vocabularies is an array of prefixes from which thesauruses you want to have suggestions
  async getSuggestions(word, vocabularies ) {
	let vocabs = vocabularies.join( "," );
    return this.http.fetch(`/thesaurus/suggestions?word=${word}&namespaces=${vocabs}`, {
      method: 'GET'
    }).then(checkStatus).then((response) => {
      return response.json();
    });
  }

  async getCampaignSuggestions(word, vocabularies, lang="all") {
		return this.http.fetch(`/thesaurus/suggestions?word=${word}&namespaces=${vocabularies}&language=${lang}`, {
	      method: 'GET'
	    }).then(checkStatus).then((response) => {
	      return response.json();
	    });
	  }

  async getGeonameSuggestions(prefix, lang="en") {
	  this.http.configure(fetchConfigGeo);
    let url = `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(prefix)}&username=annachristaki&lang=${lang}&maxRows=10`;
	  return this.http.fetch(url, {
      method: 'GET'
	  })
    .then((response) => {
      this.http.configure(reset);
      return response.json();
    });
  }

  async getColorTerm(termWikidataId) {
	  this.http.configure(fetchConfigColor);
    const termUri = `https://www.wikidata.org/wiki/Special:EntityData/${termWikidataId}.json`;
	  return this.http.fetch(termUri, {
      method: 'GET',
	  })
      .then((response) => {
        this.http.configure(reset);
        return response.json();
      });
  }

  listVocabularies() {
    return this.http.fetch('/thesaurus/listVocabularies', {
      method: 'GET'
    }).then(response => response.json());
  }

  createEmptyThesaurus(name, version, label) {
    return this.http.fetch(`/thesaurus/createEmptyThesaurus?name=${name}&version=${version}&label=${label}`, {
      method: 'POST'
    }).then(response => response.json());
  }

  deleteThesaurus(id) {
    return this.http.fetch(`/thesaurus/${id}`, {
      method: 'DELETE'
    }).then(response => response.json());
  }

  getThesaurusAdmin(name) {
    return this.http.fetch(`/thesaurus/${name}`, {
      method: 'GET'
    }).then(response => response.json());
  }

  listTerms(name) {
    return this.http.fetch(`/thesaurus/listTerms?thesaurusName=${name}`, {
      method: 'GET'
    }).then(response => response.json());
  }

  populateThesaurus(name, version, csvData) {
    return this.http.fetch(`/thesaurus/populateCustomThesaurus?thesaurusName=${name}&thesaurusVersion=${version}`, {
			method: 'POST',
			body: csvData
		});
  }

  deleteAllThesaurusTerms(id) {
    return this.http.fetch(`/thesaurus/deleteThesaurus/${id}`, {
      method: 'DELETE'
    }).then(response => response.json());
  }

  deleteTerm(id) {
    return this.http.fetch(`/thesaurus/term/${id}`, {
      method: 'DELETE'
    }).then(response => response.json());
  }

  addTerms(body) {
    return this.http.fetch('/thesaurus/addTerms', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.json());
  }

}
