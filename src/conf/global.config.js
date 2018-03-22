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


/*eslint-disable no-var*/
var settings = {
	space: 'espace',
	auth: {
		google: '',
		facebook: '132619063927809'
	},
	baseUrl: 'http://ipa.image.ntua.gr:9060', //backend goes here
	apiUrl: '/assets/developers-lite.html',
	googlekey: '',
	isoSettings: {
		// page
		page: 'default',

		// masonry
		mSelector: '.grid',
		mItem: '.item',
		mSizer: '.sizer',

		// mobile menu
		mobileSelector: '.mobilemenu',
		mobileMenu: '.main .menu',
		transDuration: 0
	},
	logLevel: 1		// Error: 1, Warn: 2, Info: 3, Debug: 4
};

// Override settings for development/testing etc
if (window.location.hostname === 'localhost') {
	settings.auth.facebook = '133438360512546';
	settings.baseUrl = 'http://localhost:9060';
	settings.logLevel = 4; // Debug
} else if (window.location.hostname === 'ipa.image.ntua.gr') {	// Override for staging
	settings.baseUrl = 'http://ipa.image.ntua.gr:9060';
} else if (window.location.hostname === 'withculture.eu' || window.location.hostname === 'www.withculture.eu') {
	settings.auth.facebook='394384180936771';
   settings.baseUrl = 'http://api.withculture.eu';
} else if (window.location.hostname === 'judaica.withculture.eu') {
	settings.space = 'judaica';
	settings.baseUrl = 'http://api.withculture.eu';
} else if (window.location.hostname === 'with.image.ntua.gr' || window.location.hostname === 'with.image.ece.ntua.gr') {
	settings.baseUrl = 'http://api.withculture.eu';
}else if (window.location.hostname === 'espaceportal.eu' || window.location.hostname === 'www.espaceportal.eu') {
	settings.auth.facebook = '132619063927809';
	settings.baseUrl = 'http://api.espaceportal.eu';
} else {
	console.log(`${window.location.hostname}`);
}

export default settings;
