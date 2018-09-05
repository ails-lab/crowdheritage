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
import { AuthService } from 'aurelia-authentication';
import fetchConfig from 'fetch.config.js';
import { checkStatus } from 'fetch.config.js';
import { User } from 'User.js';
import { Record } from 'Record.js';
import { Notification } from 'Notification.js';
import { EventAggregator } from 'aurelia-event-aggregator';

import 'isomorphic-fetch';

@inject(HttpClient, AuthService, EventAggregator)
export class UserServices {

	constructor(http, auth, eventAggregator) {
		http.configure(fetchConfig);
		this.http = http;
		this.auth = auth;
		this.ea = eventAggregator;
		this.current = null;
		this.ea.subscribe('organization-delete', (response) => this.organizationDeletedHandler(response));
	}

	// Check if there is a logged user
	isAuthenticated() {
		return this.auth.isAuthenticated();
	}

	async reloadCurrentUser() {
		return this.auth.getMe().then((response) => {
			this.current = new User(response);
		}).catch((error) => {
			this.auth.logout('/#/');
		});
	}

	// Get notifications for the current user
	getUserNotifications() {
		return this.http.fetch('/notifications/myNotifications', {
			method: 'GET',
			credentials: 'include'
		}).then(checkStatus).then((response) => response.json())
		.then((data) => {
			data.sort(function(a, b) {
				return b.openedAt - a.openedAt;
			});

			let n;
			this.current.notifications = [];
			for (n of data) {
				this.current.notifications.push(new Notification(n));
			}
			return data;
		});
	}

	notificationResponse(notification, accept = true) {
		const url = accept ? '/notifications/accept' : '/notifications/reject';
		return this.http.fetch(`${url}/${notification.id}`, {
			method: 'PUT'
		}).then(checkStatus).then((response) => {
			notification.pendingResponse = false;
			if (this.current.count.myPendingNotifications > 0) {	// Check to avoid negative notification numbers, if the number of notifications is not correct in the User
				this.current.count.myPendingNotifications--;
			}

			return response.json();
		});
	}

	getFavorites() {
		return this.http.fetch(`/collection/${this.current.favoritesCollection}/list?start=0&count=1000`, {
		// return this.http.fetch('/collection/favorites', {
			method: 'GET',
			credentials: 'include'
		}).then(checkStatus).then((response) => response.json())
		.then((data) => {
			for (let i = 0; i < data.records.length; i++) {
				let temp = new Record(data.records[i]);
				this.current.favorites.push(temp.externalId);
			}
		});
	}

	// Login using Username/Password (uses aurelia-auth plugin)
	login(credentials, options = {}, redirectUri = null) {
		return this.auth.login(credentials, options, redirectUri)
			.then((response) => {
				this.current = new User(response);
				this.ea.publish('login', {});
			})
			.catch((error) => {
				console.log(error.body);
				return 'Invalid email/username or password';
			});
	}

	// Facebook/Google Login (uses aurelia-auth plugin)
	authenticate(provider, redirectUri = null) {
		return this.auth.authenticate(provider, redirectUri)
			.then((response) => {
				this.current = new User(response);
				this.getFavorites();
				this.ea.publish('login', {});
			}).catch((error) => {
				// throw error message
			});
	}

	// User registration
	register(userInfo) {
		return this.http.fetch('/user/register', {
			method: 'POST',
			body: json(userInfo)
		});
	}

	logout(redirectUri = null) {
		this.ea.publish('logout', {});
		this.current = null;
		if(window.opener)
		 window.opener.location.reload();
		return this.auth.logout(redirectUri);

	}

	// User retrieval
	getUser(id) {
		return this.http.fetch('/user/' + id, {
			method: 'GET'
		}).then((response) => response.json());
	}

	getToken() {
		return this.http.fetch('/user/token', {
			method: 'GET'
		}).then((response) => response.text());
	}

	// Updating a User
	update(data) {
		return this.http.fetch('/user/' + data.dbId, {
			method: 'PUT',
			body: json(data)
		}).then(checkStatus).then((response) => {
			response.clone().json().then((user) => {
				this.current.load(user);
			});

			return response.json();
		});
	}

	// User deletion
	delete(id) {
		return this.http.fetch('/user/' + id, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}

	indexInEditables(collection) {
		for (let i = 0; i < this.current.editables.length; i++) {
			if (this.current.editables[i].id === collection.dbId) {
				return i;
			}
		}

		return -1;
	}

	listUserNames(prefix) {
		return this.http.fetch(`/user/listNames?onlyParents=false&forUsers=true&forGroupType=User&prefix=${prefix}`, {
			method: 'GET'
		}).then(checkStatus)
			.then((response) => response.json());
	}


    listAnnotationLeaders(groupid){
    	return this.http.fetch('/annotation/leaderboard?groupId='+groupid, {
			method: 'GET'
		}).then(checkStatus)
			.then((response) => response.json());
    }

	// Event Handlers (Listeners)
	organizationDeletedHandler(response) {
		// Remove the group from the adminInGroups array
		let index = this.current.adminInGroups.indexOf(response.id);
		if (~index) {
			this.userServices.current.adminInGroups.splice(index, 1);
		}

		// Remove the group from the organziations array
		index = this.current.organizations.indexOf(response.id);
		if (~index) {
			this.userServices.current.organizations.splice(index, 1);
		}

		// Update counter
		this.current.count.myOrganizations -= 1;
	}

}
