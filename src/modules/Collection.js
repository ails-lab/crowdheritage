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


import settings from 'global.config.js';
import { JsonUtils } from 'JsonUtils.js';

export class Collection {

	constructor(data) {
		this.description = '';
		this.acl = [];
		this.records = [];
		this.isPublic = false;
		if (data) {
			this.load(data);
		}
	}

	load(data) {
		this.dbId = data.dbId;
		this.title = data.descriptiveData.label;
		this.withCreator = data.administrative.withCreator;
		this.entryCount = data.administrative.entryCount;
		if (data.administrative.access.isPublic) {
			this.isPublic = data.administrative.access.isPublic;
		}
		if (data.descriptiveData.description) {
			this.description = data.descriptiveData.description;
		}
		this.thumbnail = null;
		this.media = [];
		this.absMedia = [];
		if (data.media) {
			this.thumbnail = data.media && data.media[0] && data.media[0].Thumbnail ? data.media[0].Thumbnail.withUrl : null;
			for (let i = 1; i < data.media.length; i++) {
				let img = data.media[i];
				if (img.Thumbnail.withUrl !== '') {
					this.media.push(img);
				}
			}
			for (let i = 0; i < Math.min(data.media.length, 5); i++) {
				let img = data.media[i];
				if (img.Thumbnail.withUrl !== '') {
					this.absMedia.push(this.getAbsUrl(img.Thumbnail.withUrl));
				}
			}
		}
		this.background = '';
		this.type = '';
		this.css = 'item collection';
		this.url = '#';
		this.owner = '';
		this.class = 'collection';
		this.route = 'collectionview';
		if (data.resourceType) {
			if (data.resourceType.indexOf('Collection') !== -1) {
				this.type = 'COLLECTION';
				this.url = '/#/collection/' + this.dbId;
			} else if (data.resourceType.indexOf('Space') !== -1) {
				this.type = 'SPACE';
				this.route = 'custom';
				this.name = data.username;
				this.css = 'item space';
				if (data.administrative.isShownAt) {
					this.url = data.administrative.isShownAt;
				}
			} else {
				this.type = 'EXHIBITION';
				this.class = 'exhibition';
				this.route = 'exhibitionview';
				this.css = 'item exhibition';
				this.url = '/#/exhibition/' + this.dbId;
			}
		}

		if (data.withCreatorInfo) {
			this.owner = data.withCreatorInfo.username;
			this.creatorFirstName = data.withCreatorInfo.firstName;
			this.creatorLastName = data.withCreatorInfo.lastName;
		}
		if (data.descriptiveData.backgroundImg && data.descriptiveData.backgroundImg.Original && data.descriptiveData.backgroundImg.Original.withUrl) {
			this.background = data.descriptiveData.backgroundImg.Original.withUrl;
		} else if (data.descriptiveData.backgroundImg && data.descriptiveData.backgroundImg.Thumbnail && data.descriptiveData.backgroundImg.Thumbnail.withUrl) {
			this.background = data.descriptiveData.backgroundImg.Thumbnail.withUrl;
		} else {
			this.background = this.thumbnail;
		}
		if(data.descriptiveData.credits) {
			this.credits = data.descriptiveData.credits;
		}
		if (data.administrative.access) {
			this.acl = data.administrative.access.acl;
		}
		this.myAccess = data.myAccess;
		this.modifiedAt = data.administrative.lastModified;
		this.createdAt = data.administrative.created;
		this.data = data;
	}

	getAbsUrl(med) {
		if (med) {
			if (med.startsWith('http')) {
				return `${med}`;
			}
			return `${settings.baseUrl}${med}`;
		}
		return '/img/assets/ui/ic-noimage.png';
	}

	get itemCountString() {
		if (this.entryCount === 1) {
			return '1 Item';
		}

		return `${this.entryCount} Items`;
	}

	get creatorName() { return `${this.creatorFirstName} ${this.creatorLastName}`; }
	get isOwner() { return this.myAccess === 'OWN'; }
	get canEdit() { return (this.myAccess === 'OWN' || this.myAccess === 'WRITE'); }
	get hasDescription() { return this.description.length > 0; }
//	get route() { return this.type ? `${this.type.toLowerCase()}view` : 'collectionview'; }

	get Thumbnail() {
		if (this.thumbnail) {
			if (this.thumbnail.startsWith('http')) {
				return `${this.thumbnail}`;
			}
			return `${settings.baseUrl}${this.thumbnail}`;
		}

		return '/img/assets/img/ui/ic-noimage.png';
	}

	get backgroundImage() {
		if (this.background) {
			if (this.background.startsWith('http')) {
				return `${this.background}`;
			}

			return `${settings.baseUrl}${this.background}`;
		}

		return '/img/assets/ui/ic-noimage.png';
	}

	shortTitle() {
		return JsonUtils.truncate(this.title, 100, true);
	}

}
