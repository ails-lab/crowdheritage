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
  project: process.env.PROJECT,
  space: process.env.SPACE,
  auth: {
    google: process.env.WITH_GOOGLE_SECRET,
    facebook: process.env.WITH_FACEBOOK_SECRET
  },
  baseUrl: process.env.BASE_URL, // Production backend
  apiUrl: process.env.API_URL,
  googlekey: process.env.WITH_GOOGLE_KEY,
  logLevel: 1 // Error: 1, Warn: 2, Info: 3, Debug: 4
};

// Override settings for development/testing etc
if (window.location.hostname === 'localhost') {
  // settings.baseUrl = process.env.WITH_BASE_URL;  // Original WITH-backend
  // settings.baseUrl = process.env.DEV_BASE_URL;   // Backend with test-DB
  settings.baseUrl = process.env.LOCAL_BASE_URL; // Local backend for testing
  // settings.project = 'WITHcrowd';
  settings.logLevel = 4; // Debug
}
// Override for staging
else if (window.location.hostname === 'withcrowd.eu') {
  settings.auth.facebook = WITHCROWD_FACEBOOK_SECRET;
  settings.baseUrl = WITHCROWD_BASE_URL;
  settings.project = 'WITHcrowd';
}
else if (window.location.hostname === 'crowdheritage.eu' || window.location.hostname === 'www.crowdheritage.eu') {
  settings.auth.facebook = CROWDHERITAGE_FACEBOOK_SECRET;
  settings.project = 'CrowdHeritage';
}
else {
  console.log(`${window.location.hostname}`);
}

export default settings;
