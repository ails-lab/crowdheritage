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


import settings from './global.config.js';

// See: https://github.com/github/fetch#handling-http-error-statuses
export function checkStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response;
	}

	let error = new Error(response.statusText);
	error.response = response;
	throw error;
}

function fetchConfigDevelopment(config) {
	config
		.withBaseUrl(settings.baseUrl)
		.withDefaults({
			//credentials: 'include',
			headers: {
				'Accept': 'application/json'
				//'Access-Control-Allow-Origin':'https://localhost:8080'
			}
		// })
		// .withInterceptor({
		// 	request(request) {
		// 		console.log(`Requesting ${request.method} ${request.url}`);
		// 		return request; // you can return a modified Request, or you can short-circuit the request by returning a Response
		// 	},
		// 	response(response) {
		// 		console.log(`Received ${response.status} ${response.url}`);
		// 		return response; // you can return a modified Response
		// 	}
		});
}

function fetchConfigProduction(config) {
	config
		.withBaseUrl(settings.baseUrl)
		.withDefaults({
			credentials: 'include',
			headers: {
				'Accept': 'application/json'
			}
		});
}

let config;

if (window.location.hostname === 'localhost') {
	config = fetchConfigDevelopment;
} else {
	config = fetchConfigProduction;
}
export default config;
