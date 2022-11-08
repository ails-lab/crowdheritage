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
import { UserServices } from 'UserServices.js';
import { Router } from 'aurelia-router';
import { I18N } from 'aurelia-i18n';

let logger = LogManager.getLogger('metadata-rating.js');

@inject(DialogController, UserServices, Router, I18N)
export class MetadataRating {

	constructor(controller, userServices, router, i18n) {
		this.controller = controller;
		this.userServices = userServices;
		this.router = router;
		this.i18n = i18n;

		this.annotation = null;
		this.errorTypes = [];

		this.noRatings = false;
    this.ratingValue = 0;
    this.ratingText = '';
    this.selectedErrorTypes = [];
    this.correctedAnnotation = '';
    this.userComment = '';
	}
  activate(params) {
    this.index = params.index;
		this.annotation = params.annotation;
		this.errorTypes = params.errorTypes;

		// Set noRatings flag to true if noone has rated this translation
    if (this.annotation.ratedBy.length === 0) {
      this.noRatings = true;
    }
		this.labelText = this.noRatings ? 'NO RATING' : `${this.annotation.ratedBy.length} RATING`;
		this.labelText += this.annotation.ratedBy.length !== 1 ? 'S' : '';

		// let selectorUrl = this.annotation.selector.property;
		// let propertyTitle = selectorUrl.substring(selectorUrl.lastIndexOf('/') + 1);
		// this.property = propertyTitle.charAt(0).toUpperCase() + propertyTitle.slice(1);
		this.property = this.annotation.selector.property;
		this.originalValue = this.annotation.selector.origValue;
		this.annotationValue = this.annotation.label;
		if (this.userServices.current) {
			this.rating = this.annotation.ratedBy.find(rate => rate.withCreator === this.userServices.current.dbId);
			console.log(this.rating)
			this.ratingValue = this.rating ? this.rating.confidence : 0;
			this.ratingText = this.rating ? this.rating.confidence : '';
			this.correctedAnnotation = this.rating ? this.rating.validationCorrection : '';
			this.userComment = this.rating ? this.rating.validationComment : '';
			if (this.rating && this.rating.validationErrorType) {
				this.rating.validationErrorType.forEach(errType => {
					this.selectedErrorTypes.push(this.errorTypes.find(e => e.tokenizedVersion === errType));
				});
			}
		}
  }

  ratingValueChanged() {
    this.ratingText = this.ratingValue;
  }
  ratingTextChanged() {
    this.ratingValue = !this.ratingText ? 0 : this.ratingText;
  }
	addErrorType(err) {
		let errorType = this.errorTypes.find(e => e.tokenizedVersion === err);
    if (errorType && !this.selectedErrorTypes.includes(errorType)) {
      this.selectedErrorTypes.push(errorType);
    }
  }
  removeSelectedError(errorType) {
    const index = this.selectedErrorTypes.indexOf(errorType);
    if (index > -1) {
      this.selectedErrorTypes.splice(index, 1);
    }
  }

  toggleCollapse() {
		// Done in js/jquery because the bootstrap way did not work
    if ($(`#collapse-${this.index}`).hasClass('in')) {
      $(`#collapse-${this.index}`).collapse('hide');
    }
    else {
      $(`#collapse-${this.index}`).collapse('show');
			// Empty corrected translation field is prefilled with the automated translation
			this.correctedAnnotation = (this.correctedAnnotation === '') ? this.annotationValue : this.correctedAnnotation;
    }
  }
  submitRating() {
    // TODO: Submit rating API call
		console.log(this.ratingValue);
  }
  submitDetails() {
    // TODO: Submit rating API call
		console.log(this.selectedErrorTypes, this.correctedAnnotation, this.userComment);
  }
}
