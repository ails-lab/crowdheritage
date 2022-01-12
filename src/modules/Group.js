import settings from 'global.config.js';

export class Group {

	constructor(data) {
		this.dbId = data.dbId;
		this.username = data.username;
		this.avatar = data.avatar;
		this.about = data.about;
		this.created = data.created;
		this.creator = data.creator;
		this.admins = data.adminIds;
		this.privateGroup = data.privateGroup;
		this.parentGroups = data.parentGroups;
		this.friendlyName = data.friendlyName;
		this.creatorFirstName = data.firstName;
		this.creatorLastName = data.lastName;
		this.page = data.page;
		this.count = data.count ? data.count : { Collections: 0, Exhibitions: 0 };
		this.totalCount = this.count.Collections + this.count.Exhibitions;
		this.collections = [];
		this.type = data.type;

		if (data.totalCollections) { this.count.Collections = data.totalCollections; }
		if (data.totalExhibitions) { this.count.Exhibitions = data.totalExhibitions; }
	}

	get id() { return this.dbId; }
	get isPrivate() { return this.privateGroup; }
	get creatorName() { return `${this.creatorFirstName} ${this.creatorLastName}`; }
	get name() { return this.friendlyName; }
	get logo() {
		if (this.avatar && this.avatar.Square) {
			return `${settings.baseUrl}${this.avatar.Square}`;
		}
		return '/assets/img/ui/profile-placeholder.png';
	}
	get edit() { return this.type === 'Organization' ? 'orgedit' : 'groupedit'; }
	get cover() {
		if (this.page && this.page.cover && this.page.cover.Original) {
			return `${settings.baseUrl}${this.page.cover.Original}`;
		}

		return '/assets/img/content/background-space.png';
	}
	get coverCSS() { return { 'background-image': `url(${this.cover})` }; }
	get map() {
		if (this.page && this.page.coordinates && this.page.coordinates.latitude && this.page.coordinates.longitude) {
			return `https://www.google.com/maps/embed/v1/place?q=${this.page.coordinates.latitude},${this.page.coordinates.longitude}&key=${settings.googlekey}`;
		}

		return null;
	}
	get country() {
		return this.page && this.page.country ? this.page.country : '';
	}
}
