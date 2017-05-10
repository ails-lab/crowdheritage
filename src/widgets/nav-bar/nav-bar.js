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


import { bindable, inject } from 'aurelia-framework';
import { UserServices } from '../../modules/UserServices.js';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DialogService } from 'aurelia-dialog';
import { Notification } from '../../modules/Notification.js';
import settings from '../../conf/global.config.js';

@inject(UserServices, Router, EventAggregator, DialogService)
export class NavBar {

  @bindable router = null;

  constructor(userServices, router, eventAggregator, dialogService) {
		this.userServices = userServices;
		this.router = router;
		this.locked = false;
		this.ea = eventAggregator;
		this.dialogService = dialogService;
	}

  // Properties
	get isAuthenticated() { return this.userServices.isAuthenticated(); }
	get user() { return this.userServices.current; }

  // UI Functions
  loginPopup() {
		this.dialogService.open({
			viewModel: 'widgets/logindialog/logindialog.js'
		}).then((response) => {
			if (!response.wasCancelled) {
				console.log('NYI - Login User');
			} else {
				console.log('Login cancelled');
			}
		});
	}

  logout(redirectUri) {
		this.userServices.logout(redirectUri);
	}

  getProfileImage(user) {
		if (user) {
      if (user.avatar.Thumbnail) {
        return `${settings.baseUrl}${user.avatar.Thumbnail}`;
      }
		}
		return '/img/assets/images/user.png';
	}

  getName(user) {
    if (user) {
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      else {
        return `${user.username}`;
      }
    }
  }

  activate() {
    // Socket initialization
		let domainUrl = `${settings.baseUrl}`.replace('http://', '');

		this.notificationSocket = new WebSocket('ws://' + domainUrl + '/notifications/socket');
		if (this.userServices.current !== null) {
			this.waitForConnection(() => {
				this.notificationSocket.send('{"action":"login","id":"' + this.userServices.current.id + '"}');
			}, 1000);
		}

		this.notificationSocket.onopen = () => {
			// Socket open
		};

		this.notificationSocket.onmessage = (evt) => {
			let notification = new Notification(JSON.parse(evt.data));
			let message = this.extractNotificationMessage(notification);
			if (message !== null) {
				this.ea.publish('notification-received', notification);
				toastr.info(message);
			}

			switch (notification.activity) {
			case 'COLLECTION_SHARE':
				this.ea.publish('collection-shared', notification.resource);
				break;
			case 'EXHIBITION_SHARE':
				this.ea.publish('exhibition-shared', notification.resource);
				break;
			case 'COLLECTION_UNSHARED':
				this.ea.publish('collection-unshared', notification.resource);
				break;
			case 'EXHIBITION_UNSHARED':
				this.ea.publish('exhibition-unshared', notification.resource);
				break;
			case 'GROUP_REQUEST_ACCEPT':
				this.ea.publish('group-joined', notification.group);
				break;
			case 'GROUP_REMOVAL':
				this.ea.publish('group-left', notification.group);
				break;
			case 'RECORD_ANNOTATING_COMPLETED':
				this.ea.publish('annotations-created', notification.resource);
				break;
			default: // Do nothing
			}
		};

		this.notificationSocket.onclose = (evt) => {
			console.log('disconnected');
		};

		this.ea.subscribe('login', () => this.socketLoginHandler());
		this.ea.subscribe('logout', () => this.socketLogoutHandler());
  }

  waitForConnection(callback, interval) {
		if (this.notificationSocket.readyState === 1) {
			callback();
		} else {
			// optional: implement backoff for interval here
			setTimeout(() => {
				this.waitForConnection(callback, interval);
			}, interval);
		}
	}

	socketLoginHandler() {
		this.waitForConnection(() => {
			this.notificationSocket.send('{"action":"login","id":"' + this.userServices.current.id + '"}');
		}, 1000);
	}

	socketLogoutHandler() {
		this.waitForConnection(() => {
			this.notificationSocket.send('{"action":"logout","id":"' + this.userServices.current.id + '"}');
		}, 1000);
	}

  extractNotificationMessage(value) {
		switch (value.activity) {
		case 'GROUP_INVITE':
			return `<strong>${value.senderName}</strong> invites you to join <strong>${value.groupName}</strong>`;
		case 'GROUP_INVITE_ACCEPT':
			return `<strong>${value.senderName}</strong> joined <strong>${value.groupName}</strong>`;
		case 'GROUP_INVITE_DECLINED':
			return `<strong>${value.senderName}</strong> declined your invitation to join <strong>${value.groupName}</strong>`;
		case 'GROUP_REQUEST':
			return `<strong>${value.senderName}</strong> wants to join <strong>${value.groupName}</strong>`;
		case 'GROUP_REQUEST_ACCEPT':
			return `You joined <strong>${value.groupName}</strong>`;
		case 'GROUP_REQUEST_DENIED':
			return `Your request to join <strong>${value.groupName}</a> was declined`;
		case 'COLLECTION_SHARE':
			if (value.shareInfo.sharedWithGroup) {
				return `<strong>${value.senderName}</strong> wants to share collection <strong>${value.resourceName}</strong> with <strong>${value.shareInfo.userOrGroupName}</strong>`;
			}
			return `<strong>${value.senderName}</strong> wants to share collection <strong>${value.resourceName}</strong> with you`;
		case 'COLLECTION_SHARED':
			if (value.shareInfo.sharedWithGroup) {
				return `<strong>${value.resourceName}</strong> is now shared with <strong>${value.shareInfo.userOrGroupName}</strong>`;
			}
			return `<strong>${value.resourceName}</strong> is now shared with <strong>${value.senderName}</strong>`;
		case 'COLLECTION_UNSHARED':
			if (value.shareInfo.sharedWithGroup) {
				return `<strong>${value.resourceName}</strong> is no longer shared with <strong>${value.shareInfo}.userOrGroupName</strong>`;
			}
			return `<strong>${value.resourceName}</strong> is no longer shared with you`;
		case 'COLLECTION_REJECTED':
			return `<strong>${value.shareInfo.userOrGroupName}</strong> is not interested in collection <strong>${value.resourceName}</strong>`;
		case 'EXHIBITION_SHARE':
			if (value.shareInfo.sharedWithGroup) {
				return `<strong>${value.senderName}</strong> wants to share exhibition <strong>${value.resourceName}</strong> with <strong>${value.shareInfo.userOrGroupName}</strong>`;
			}
			return `<strong>${value.senderName}</strong> wants to share exhibition <strong>${value.resourceName}</strong> with you`;
		case 'EXHIBITION_SHARED':
			if (value.shareInfo.sharedWithGroup) {
				return `<strong>${value.resourceName}</strong> is now shared with <strong>${value.shareInfo.userOrGroupName}</strong>`;
			}
			return `<strong>${value.resourceName}</strong> is now shared with <strong>${value.senderName}</strong>`;
		case 'EXHIBITION_UNSHARED':
			if (value.shareInfo.sharedWithGroup) {
				return `<strong>${value.resourceName}</strong> is no longer shared with <strong>${value.shareInfo}.userOrGroupName</strong>`;
			}
			return `<strong>${value.resourceName}</strong> is no longer shared with you`;
		case 'EXHIBITION_REJECTED':
			return `<strong>${value.shareInfo.userOrGroupName}</strong> is not interested in exhibition <strong>${value.resourceName}</strong>`;
		case 'COLLECTION_ANNOTATING_COMPLETED':
			return `Annotating of collection <strong>${value.resourceName}</strong> has finished`;
		case 'RECORD_ANNOTATING_COMPLETED':
			return `Annotating of record <strong>${value.resourceName}</strong> has finished`;
		case 'MESSAGE':
			return value.message;
		default:
			return null;
		}
	}
}
