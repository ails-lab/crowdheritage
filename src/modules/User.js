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


import settings from '../conf/global.config.js';

export class User {

	constructor(data) {
		// Load data from the backend
		this.load(data);

		// Initialize data structures for user collections/exhibitions/etc
		// TODO: Remove obsolete information when the new calls are in place
		this.favoritesCollection = data.favorites;
		this.userGroupsIds = data.userGroupIds ? data.userGroupIds : [];
		this.adminInGroups = data.adminInGroups ? data.adminInGroups : [];
		this.groups = [];
		this.notifications = [];

		this.favorites = data.favoriteIds ? data.favoriteIds : [];
		this.editables = [];
		this.myCollections = [];
		this.mySharedCollections = [];
		this.myExhibitions = [];
		this.mySharedExhibitions = [];
		this.count = $.extend(true, { annotations: parseInt(data.annotationCount, 10) }, data.count);
	}

	// Properties
	get id() { return this.dbId; }
	get fullName() { return `${this.firstName} ${this.lastName}`; }
	get profileImage() {
		if (this.avatar && this.avatar.Square) {
			return `${settings.baseUrl}${this.avatar.Square}`;
		}
		return '/img/assets/images/user.png';
	}
	get hasFacebook() { return this.facebookId !== null; }
	get hasGoogle() { return this.googlekId !== null; }

	// Functions
	clone() {
		return new User(this);
	}

	load(data) {
		this.dbId = data.dbId;
		this.firstName = data.firstName;
		this.lastName = data.lastName;
		this.email = data.email;
		this.username = data.username;
		this.about = data.about;
		this.gender = data.gender;
		this.avatar = {
			Original: data.avatar && data.avatar.Original ? data.avatar.Original : null,
			Thumbnail: data.avatar && data.avatar.Thumbnail ? data.avatar.Thumbnail : null,
			Square: data.avatar && data.avatar.Square ? data.avatar.Square : null,
			Tiny: data.avatar && data.avatar.Tiny ? data.avatar.Tiny : null,
			Medium: data.avatar && data.avatar.Medium ? data.avatar.Medium : null
		};
		this.facebookId = data.facebookId;
		this.googleId = data.googleId;
	}
}
