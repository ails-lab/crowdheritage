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


import { inject, LogManager } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';
import { CampaignServices } from 'CampaignServices.js';
import { I18N } from 'aurelia-i18n';

let logger = LogManager.getLogger('publishdialog.js');

@inject(DialogController, CampaignServices, I18N)
export class PublishDialog {

	constructor(controller, campaignServices, i18n) {
		this.controller = controller;
		this.campaignServices = campaignServices;
    this.i18n = i18n;

		this.campaign = null;
    this.rejectDownvoted = false;
		this.minScore = '';
		this.validationStarted = '';
	}

	get currentLocale() { return window.location.href.split('/')[3]; }

	get inputChanged() {
		if (!this.campaign.publishCriteria) {
			return true;
		}
		else {
			return this.rejectDownvoted === this.campaign.publishCriteria.allowRejected
				|| parseInt(this.minScore) !== this.campaign.publishCriteria.minScore;
		}
	}

	activate(params) {
		this.campaign = params;

		if (this.campaign.publishCriteria) {
			this.rejectDownvoted = !this.campaign.publishCriteria.allowRejected;
			this.minScore = this.campaign.publishCriteria.minScore;
			this.validationStarted = this.campaign.publishCriteria.validationStarted;
		}
	}

	initiateValidation() {
		if (!this.inputChanged) {
			this.controller.cancel();
			return;
		}
		if (confirm(this.i18n.tr('moderation:export-dialog-warning'))) {
			this.campaignServices.initiateValidation(this.campaign.dbId, this.rejectDownvoted, this.minScore)
				.then(response => {
					this.controller.ok();
					return;
				})
				.catch(error => console.error(error));
    }
	}

	attached() {
    $('.accountmenu').removeClass('active');
  }

}
