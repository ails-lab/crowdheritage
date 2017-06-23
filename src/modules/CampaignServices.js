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
import { HttpClient, json } from 'aurelia-fetch-client';
import fetchConfig from '../conf/fetch.config.js';
import { checkStatus } from '../conf/fetch.config.js';

@inject(HttpClient)
export class CampaignServices {

  constructor(http) {
    http.configure(fetchConfig);
    this.http = http;
  }

  getCampaignsCount(group) {
    return this.http.fetch(`/campaign/count?group=${group}`, {
			method: 'GET'
		}).then((response) => response.json());
  }

  getCampaign(campaignid) {
    return this.http.fetch(`/campaign/getCampaign?campaignId=${campaignid}`, {
			method: 'GET'
		}).then((response) => response.json());
  }

  getCampaignByName(cname) {
    return this.http.fetch(`/campaign/getCampaignByName?cname=${cname}`, {
			method: 'GET'
		}).then((response) => response.json());
  }

  getActiveCampaigns( {group = '', sortBy= "", offset = 0, count = 0} = {} ) {
    return this.http.fetch(`/campaign/activeCampaigns?group=${group}&sortBy=${sortBy}&offset=${offset}&count=${count}`, {
			method: 'GET'
		}).then((response) => response.json());
  }

  incUserPoints(campaignId, userId, annoType) {
    return this.http.fetch(`/campaign/incUserPoints?campaignId=${campaignId}&userId=${userId}&annotationType=${annoType}`, {
      method: 'GET'
    }).then(checkStatus);
  }

  decUserPoints(campaignId, userId, annoType) {
    return this.http.fetch(`/campaign/decUserPoints?campaignId=${campaignId}&userId=${userId}&annotationType=${annoType}`, {
      method: 'GET'
    }).then(checkStatus);
  }

}
