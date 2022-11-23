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
import { UserServices } from 'UserServices.js';
import { AnnotationServices } from 'AnnotationServices.js';
import { CampaignServices } from 'CampaignServices.js';
import { Router } from 'aurelia-router';
import { I18N } from 'aurelia-i18n';
import { EventAggregator } from 'aurelia-event-aggregator';
import settings from 'global.config.js';

let logger = LogManager.getLogger('metadata-rating.js');

@inject(UserServices, AnnotationServices, CampaignServices, Router, I18N, EventAggregator)
export class MetadataRating {

	constructor(userServices, annotationServices, campaignServices, router, i18n, eventAggregator) {
		this.userServices = userServices;
		this.annotationServices = annotationServices;
		this.campaignServices = campaignServices;
		this.router = router;
		this.i18n = i18n;
		this.ea = eventAggregator;

		this.annotation = null;
		this.errorTypes = [];

		this.arrowImg = "/img/ic-arrow-down-black.png";
		this.noRatings = false;
    this.ratingValue = 0;
    this.ratingText = '';
    this.selectedErrorTypes = [];
    this.correctedAnnotation = '';
    this.userComment = '';
	}
  activate(params) {
    this.selectedErrorTypes = [];
    this.index = params.index;
		this.campaign = params.campaign;
		this.annotation = params.annotation;
		this.errorTypes = params.campaign.validationErrorTypes;
		this.generator = `${settings.project} ${this.campaign.username}`;
		this.itemRatedByMe = params.itemRatedByMe;

		// Set noRatings flag to true if noone has rated this translation
    if (!this.annotation.ratedBy || this.annotation.ratedBy.length === 0) {
      this.noRatings = true;
    }
		this.property = this.annotation.selector.property;
		this.originalValue = this.annotation.selector.origValue;
		this.originalLanguage = this.annotation.selector.origLang;
		this.annotationValue = this.annotation.label;
		this.annotationLanguage = this.annotation.labelLang;
		if (this.userServices.current) {
			this.rating = this.annotation.ratedBy ? this.annotation.ratedBy.find(rate => rate.withCreator === this.userServices.current.dbId) : 0;
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

	get isCampaignOrganizer() {
    if (this.userServices.current)
      return this.campaign.creators.includes(this.userServices.current.dbId);
    else
      return false;
  }

	get isReviewAccordionOpen() { return $(`#collapse-${this.index}`).hasClass('in'); }

	get labelText() {
		let txt = this.noRatings ? 'NO RATING' : `${this.annotation.ratedBy.length} RATING`;
		txt += !this.annotation.ratedBy || this.annotation.ratedBy.length !== 1 ? 'S' : '';
		return txt;
	}

	get cardClass() {
		let className = "";
		className += (this.noRatings) ? " no-ratings" : " with-ratings";
		className += (this.isCampaignOrganizer && !this.noRatings) ? " view-ratings" : "";
		return className;
	}

	resetRatingForm() {
		this.ratingValue = 0;
		this.ratingText = '';
		this.selectedErrorTypes = [];
		this.correctedAnnotation = '';
		this.userComment = '';
		if (this.isReviewAccordionOpen) {
			this.toggleCollapse();
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
    if (this.isReviewAccordionOpen) {
      $(`#collapse-${this.index}`).collapse('hide');
			this.arrowImg = "/img/ic-arrow-down-black.png";
    }
    else {
      $(`#collapse-${this.index}`).collapse('show');
			this.arrowImg = "/img/ic-arrow-up-black.png";
			// Empty corrected translation field is prefilled with the automated translation
			this.correctedAnnotation = (!this.correctedAnnotation) ? this.annotationValue : this.correctedAnnotation;
    }
  }
  submitRating() {
		if (!this.userServices.current) {
			toastr.error('You need to login first');
			this.resetRatingForm();
			return;
		}
		if (this.ratingValue < 0 || this.ratingValue > 100) {
			toastr.error('Invalid rating value');
			this.ratingValue = 0;
			return;
		}
		document.body.style.cursor = 'wait';
    this.annotationServices.rateAnnotation(this.annotation.dbId, this.generator, this.ratingValue)
			.then(() => {
				document.body.style.cursor = 'default';
				toastr.success('Your rating has been submitted');
				this.ea.publish('rating-added');
				if (!this.annotation.ratedByMe) {
					this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'rated');
					if (!this.itemRatedByMe) {
						this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records');
					}
				}
			})
			.catch(error => {
				toastr.error('Something went wrong');
				this.resetRatingForm();
				console.error(error.message);
				document.body.style.cursor = 'default';
			});
  }
  submitReview() {
		if (!this.userServices.current) {
			toastr.error('You need to login first');
			this.resetRatingForm();
			return;
		}
		if (!this.ratingText) {
			toastr.error('You need to enter a rating value');
			return;
		}
		document.body.style.cursor = 'wait';
		let errTypes = this.selectedErrorTypes.map(e => e.tokenizedVersion);
		errTypes = !errTypes.length ? null : errTypes;
		let correction = !this.correctedAnnotation ? null : this.correctedAnnotation;
		correction = (correction == this.annotationValue) ?  null : correction;
		let comment = !this.userComment ? null : this.userComment;
    this.annotationServices.reviewAnnotation(this.annotation.dbId, this.generator, this.ratingValue, correction, comment, errTypes)
			.then(() => {
				document.body.style.cursor = 'default';
				toastr.success('Your review has been submitted');
				this.toggleCollapse();
				this.ea.publish('rating-added');
				if (!this.annotation.ratedByMe) {
					this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'rated');
					if (!this.itemRatedByMe) {
						this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records');
					}
				}
			})
			.catch(error => {
				toastr.error('Something went wrong');
				this.resetRatingForm();
				console.error(error.message);
				document.body.style.cursor = 'default';
			});
  }

	openRatingsModal() {
		if (!this.isCampaignOrganizer || this.noRatings) {
			return;
		}
		this.ea.publish('open-ratings-modal', this.index);
	}
}
