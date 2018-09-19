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
import { checkStatus } from 'fetch.config.js';

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
  
  async getCampaignSuggestions(word, campaignId ) {
		return this.http.fetch(`/thesaurus/suggestions?word=${word}&campaignId=${campaignId}`, {
	      method: 'GET'
	    }).then(checkStatus).then((response) => {
	      return response.json();
	    });
	  }

}
