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
import fetchConfig from 'fetch.config.js';
import { checkStatus } from 'fetch.config.js';

@inject(HttpClient)
export class CampaignServices {

  constructor(http) {
    http.configure(fetchConfig);
    this.http = http;
  }

  getCampaignsCount(group, project, state) {
    return this.http.fetch(`/campaign/count?group=${group}&project=${project}&state=${state}`, {
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

  deleteCampaign(id) {
    return this.http.fetch(`/campaign/${id}`, {
			method: 'DELETE'
		}).then(checkStatus);
  }

	editCampaign(id, newCamp) {
    return this.http.fetch(`/campaign/${id}`, {
			method: 'PUT',
			body: json(newCamp)
		}).then((response) => response.json());
  }

  getCampaigns( {project = "CrowdHeritage", state = "all", sortBy= "Date_desc", offset = 0, count = 0} = {} ) {
    return this.http.fetch(`/campaign/campaigns?project=${project}&state=${state}&sortBy=${sortBy}&offset=${offset}&count=${count}`, {
			method: 'GET'
		}).then((response) => response.json());
  }

  getUserCampaigns(offset = 0, count = 0) {
    return this.http.fetch(`/campaign/userCampaigns?offset=${offset}&count=${count}`, {
			method: 'GET'
		}).then((response) => response.json());
  }

  newCampaign(campaign) {
		return this.http.fetch('/campaign/createCampaign', {
			method: 'POST',
			body: json(campaign)
		}).then(checkStatus).then((response) => response.json());
	}

  createEmptyCampaign(campaignUserName) {
    return this.http.fetch(`/campaign/createEmptyCampaign?campaignUserName=${campaignUserName}`, {
			method: 'POST'
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

  getPopularAnnotations(campaignName='', term='', offset=0, count=20) {
    return this.http.fetch(`/campaign/popularAnnotations?campaignName=${campaignName}&term=${term}&offset=${offset}&count=${count}`, {
			method: 'GET'
		}).then((response) => response.json());
  }

  getCampaignContributors(cname='') {
    return this.http.fetch(`/campaign/contributors?cname=${cname}`, {
      method: 'GET'
    }).then((response) => response.json());
  }

  initiateValidation(campaignId, allowRejected, minScore) {
    return this.http.fetch(`/campaign/initiateValidation?campaignId=${campaignId}&allowRejected=${allowRejected}&minScore=${minScore}`, {
      method: 'POST'
    }).then(response => response);
  }

  getCampaignStatistics(cname) {
    return this.http.fetch(`/campaign/statistics?cname=${cname}`, {
      method: 'GET'
    }).then(response => response.json());
  }

  exportCampaignAnnotations(campaignName, filter) {
    return this.http.fetch(`/annotation/exportCampaignAnnotations?campaignName=${campaignName}&europeanaModelExport=false&filterForPublish=${filter}`, {
      method: 'GET'
    }).then(response => response.json());
  }

  importNtuaAnnotations(campaignName, motivation, annotationsObject) {
    return this.http.fetch(`/campaign/${campaignName}/importAnnotations?motivation=${motivation}`, {
      method: 'POST',
      body: json(annotationsObject)
    });
  }

  importMintAnnotations(campaignName, motivation, mintUrl) {
    return this.http.fetch(`/campaign/${campaignName}/importMintAnnotations?motivation=${motivation}&mintUrl=${mintUrl}`, {
      method: 'POST',
    });
  }



}
