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
        facebook: ''
    },
    baseUrl: 'https://api.crowdheritage.eu',    // Production backend
    apiUrl: '/assets/developers-lite.html',
    googlekey: '',
    logLevel: 1     // Error: 1, Warn: 2, Info: 3, Debug: 4
};

try {
        var localSettings = require('./local.config.js');
        $.extend(true, settings, localSettings.settings);
} catch (err) {
        console.log("Local configuration file not available");
}

export default settings;
