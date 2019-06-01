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
import { UserServices } from 'UserServices.js';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DialogService } from 'aurelia-dialog';
import { Notification } from 'Notification.js';
import settings from 'global.config.js';
import {initMobileMenu} from 'utils/Plugin.js';
import { PLATFORM } from 'aurelia-pal';
import { I18N } from 'aurelia-i18n';

@inject(UserServices, Router, EventAggregator, DialogService, I18N)
export class NavBar {

  @bindable router = null;

  constructor(userServices, router, eventAggregator, dialogService, i18n) {
		this.userServices = userServices;
		this.router = router;
		this.locked = false;
		this.ea = eventAggregator;
		this.dialogService = dialogService;

    this.project = settings.project;
    this.logo = "/img/ic-logo1.png";
    if (this.project == 'CrowdHeritage') {
      this.logo = '/img/ic-logo2.png';
    }

    this.i18n = i18n;
    this.locales = [
      { title: "English",     code: "en", flag: "/img/assets/images/flags/en.png" },
      { title: "Italiano",    code: "it", flag: "/img/assets/images/flags/it.png" },
      { title: "Français",    code: "fr", flag: "/img/assets/images/flags/fr.png" }
      //{ title: "Ελληνικά",    code: "el", flag: "/img/assets/images/flags/el.png" },
      //{ title: "Deutsch",     code: "de", flag: "/img/assets/images/flags/de.png" },
      //{ title: "Español",     code: "es", flag: "/img/assets/images/flags/es.png" },
      //{ title: "Nederlands",  code: "nl", flag: "/img/assets/images/flags/nl.png" },
      //{ title: "Polszczyzna", code: "pl", flag: "/img/assets/images/flags/pl.png" }
    ];
    this.currentLocale;
    this.currentLocaleCode;
	}

  attached(){
	  initMobileMenu();
  }

  // Properties
	get isAuthenticated() { return this.userServices.isAuthenticated(); }
	get user() { return this.userServices.current; }
  get locale() { return window.location.href.split('/')[3]; }

  // UI Functions
  loginPopup() {
		this.dialogService.open({
			viewModel: PLATFORM.moduleName('widgets/logindialog/logindialog')
		}).then((response) => {
			if (!response.wasCancelled) {
				console.log('NYI - Login User');
			} else {
				console.log('Login cancelled');
			}
		});
	}

  toggleNavMenu() {
    if ($('#accountmenu').hasClass('active')) {
      $('#accountmenu').removeClass('active');
    }
    else {
      $('#accountmenu').addClass('active');
    }
  }

  toggleLangMenu() {
    if ($('.lang').hasClass('open')) {
      $('.lang').removeClass('open');
    }
    else {
      $('.lang').addClass('open');
    }
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

  getLocale() {
    this.currentLocaleCode = this.locale;
    for (let loc of this.locales) {
      if (loc.code == this.currentLocaleCode) {
        this.currentLocale = loc;
        return this.currentLocale;
      }
    }
    // If the language paremeter is not a valid one redirect to English home page
    let index = this.router.routes.find(x => x.name === 'index');
    this.router.navigateToRoute('index', {lang: 'en'});
  }

  changeLang(loc) {
    let url = window.location.href.split('/');
    if (url[3] == loc) {
      return;
    }
    else {
      url[3] = loc;
      window.location.href = url.join('/');
    }
  }

  activate() {
    this.i18n.setLocale(this.locale);
    this.getLocale();

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
