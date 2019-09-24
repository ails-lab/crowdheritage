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


/* eslint-disable no-var */
var settings = {
	project: 'CrowdHeritage',
	space: 'espace',
	auth: {
		google: '',
		facebook: '' //localhost
	},
	baseUrl: 'https://api.withculture.eu', // Production backend
	apiUrl: '/assets/developers-lite.html',
	googlekey: '',
  logLevel: 1 // Error: 1, Warn: 2, Info: 3, Debug: 4
};

// Override settings for development/testing etc
if (window.location.hostname === 'localhost') {
	// settings.baseUrl = 'https://api.withcrowd.eu';  // Backend with test-DB
	// settings.baseUrl = 'http://localhost:9060';    // Local backend for testing
	settings.project = 'CrowdHeritage';
	settings.logLevel = 4; // Debug
}
// Override for staging
else if (window.location.hostname === 'withcrowd.eu') {
	settings.auth.facebook='';
}
else if (window.location.hostname === 'crowdheritage.eu' || window.location.hostname === 'www.crowdheritage.eu') {
	settings.auth.facebook='';
	settings.project = 'CrowdHeritage';
	seetings.baseUrl: 'https://api.crowdheritage.eu';
}
else {
  console.log(`${window.location.hostname}`);
}

export default settings;
