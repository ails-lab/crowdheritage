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
import settings from 'global.config.js';

@inject(HttpClient)
export class MediaServices {

	constructor(http) {
		http.configure(fetchConfig);
		this.http = http;
	}

	upload(data) {
		return this.http.fetch('/media/create', {
			method: 'POST',
			body: data
		}).then(checkStatus).then((response) => response.json());
	}

	createFromUrl(url) {
		return this.http.fetch('/media/create', {
			method: 'POST',
			body: json({ url: url })
		}).then(checkStatus).then((response) => response.json());
	}

	getGoogleUrl(googleId) {
		let url = `https://www.googleapis.com/plus/v1/people/${googleId}?fields=image&key=${settings.googlekey}`;
		return this.http.fetch(url, {
			method: 'GET'
		}).then(checkStatus).then((response) => response.json());
	}

	// Returns an object containing all the thubmnails
	static toObject(data) {
		return {
			Original: data.original,
			Thumbnail: data.thumbnail,
			Square: data.square,
			Tiny: data.tiny,
			Medium: data.medium
		};
	}

}
