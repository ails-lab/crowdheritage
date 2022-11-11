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

let logger = LogManager.getLogger('logindialog.js');

@inject(DialogController)
export class RatingsDialog {
	constructor(controller) {
		this.controller = controller;
		this.annotation = null;
		this.ratings = [];
		this.averageRating = 0;
	}

	getAverage(values) {
		const sum = values.reduce((a, b) => a + b, 0);
		const avg = (sum / values.length) || 0;
		return Math.round(avg * 100) / 100;
	}

	getErrorDescription(err) {
		return this.campaign.validationErrorTypes.find(e => e.tokenizedVersion == err).longDescription;
	}

	activate(params) {
		this.campaign = params.campaign;
		this.annotation = params.annotation;
		this.ratings = this.annotation.ratedBy.sort(function(a, b) {
			return b.confidence - a.confidence;
		});
		this.averageRating = this.getAverage(this.ratings.map(rating => rating.confidence));
	}

	attached() {
    $('.accountmenu').removeClass('active');
  }

}
