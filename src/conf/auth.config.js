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

var config = {
  baseUrl: settings.baseUrl,
  signupUrl: '/user/register',
  loginUrl: '/user/login',
  profileUrl: '/user/me',
  tokenName: 'id_token',
  // token_prefix: 'WITH',
  // accessTokenName: 'dbId',
  loginRedirect: '#/my',
  providers: {
    google: {
      clientId: '239531826023-ibk10mb9p7ull54j55a61og5lvnjrff6.apps.googleusercontent.com',
      url: '/user/googleLogin'
    },
    facebook: {
      clientId: '1452782111708498',
      url: '/user/facebookLogin'
    }
  }
};

export default config;
