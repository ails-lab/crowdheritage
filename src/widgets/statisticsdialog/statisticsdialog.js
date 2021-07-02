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

let logger = LogManager.getLogger('logindialog.js');

@inject(DialogController, CampaignServices)
export class StatisticsDialog {

	constructor(controller, campaignServices) {
		this.controller = controller;
		this.campaignServices = campaignServices;

		this.loading = false;
		this.statistics = [];
	}

	get currentLocale() { return window.location.href.split('/')[3]; }

	getPercentage(a, b) {
		return (100 * a / b).toFixed(2);
	}

	activate(params) {
		this.loading = true;

		this.campaignServices.getCampaignStatistics(params)
			.then(response => {
				for (const key in response) {
					this.statistics[key] = response[key];
				}
				this.statistics.push({'key': 'Campaign', 'value': response["campaign"]});
				this.statistics.push({'key': 'Contributors', 'value': response["contributors"]});
				this.statistics.push({'key': 'Collections', 'value': response["collections"]});
				this.statistics.push({'key': 'Items', 'value': response["items-total"]});
				this.statistics.push({'key': 'Annotated items', 'value': `${response["items-annotated"]} (${this.getPercentage(response["items-annotated"],response["items-total"])}%)`});
				this.statistics.push({'key': 'Annotations', 'value': response["annotations-total"]});
				this.statistics.push({'key': 'Annotations (approved)', 'value': `${response["annotations-accepted"]} (${this.getPercentage(response["annotations-accepted"],response["annotations-total"])}%)`});
				this.statistics.push({'key': 'Annotations (rejected)', 'value': `${response["annotations-rejected"]} (${this.getPercentage(response["annotations-rejected"],response["annotations-total"])}%)`});
				this.statistics.push({'key': 'Total annotation upvotes', 'value': response["upvotes"]});
				this.statistics.push({'key': 'Total annotation downvotes', 'value': response["downvotes"]});

				this.loading = false;
			})
	}

	attached() {
    $('.accountmenu').removeClass('active');
  }

}
