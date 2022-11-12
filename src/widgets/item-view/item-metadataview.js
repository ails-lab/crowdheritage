import { inject } from 'aurelia-framework';
import { DialogService } from 'aurelia-dialog';
import { Router } from 'aurelia-router';
import { I18N } from 'aurelia-i18n';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Annotation } from 'Annotation';
import { UserServices } from 'UserServices';
import { RecordServices } from 'RecordServices';
import settings from 'global.config.js';

@inject(DialogService, Router, I18N, EventAggregator, UserServices, RecordServices)
export class ItemMetadataView {
  constructor(dialogService, router, i18n, eventAggregator, userServices, recordServices) {
    this.dialogService = dialogService;
    this.router = router;
    this.i18n = i18n;
    this.ea = eventAggregator;
    this.userServices = userServices;
    this.recordServices = recordServices;

    this.collection = null;
    this.campaign = '';
    this.cname = '';
    this.record = null;
    this.mediaDiv = '';
    this.metadataMode = true;

    this.annotations = [];
    this.previous = null;
    this.recId = '';
    this.loc = '';
  }

  activate(params) {
    this.loc = params.lang;
    this.campaign = params.campaign;
    this.record = params.record;
    this.mediaDiv = params.mediaDiv;
    this.cname= this.campaign.username;
    this.recId = this.record.dbId;
    this.generator = `${settings.project} ${this.campaign.username}`;
    this.ratedByMe = false;

    this.fetchAnnotations();

    this.ratingListener = this.ea.subscribe('rating-added', () => this.fetchAnnotations());
    this.ratingsModalListener = this.ea.subscribe('open-ratings-modal', (index) => this.openRatingsModal(index));
  }

  fetchAnnotations() {
    this.annotations = [];
    this.campaign.motivation.forEach(motivation => {
      this.recordServices.getAnnotations(this.recId, motivation, this.generator)
        .then(response => {
          for (let ann of response) {
            let user = this.userServices.current ? this.userServices.current.dbId : "";
            let annotation = new Annotation(ann, user, "all", this.generator);
            if (user && !this.ratedByMe) {
              if (annotation.ratedBy) {
                this.ratedByMe = !!annotation.ratedBy.find(rate => rate.withCreator === this.userServices.current.dbId);
              }
            }
            this.annotations.push(annotation);
          }
          this.annotations.sort(function(a, b) {
            return a.score - b.score;
          });
        })
        .catch(error => console.error(error.message));
    });
  }

  openRatingsModal(annotationIndex) {
		this.dialogService.open({
			viewModel: PLATFORM.moduleName('widgets/ratingsdialog/ratingsdialog'),
      overlayDismiss: false,
      model: {campaign: this.campaign, annotation: this.annotations[annotationIndex]}
		});
	}

  quickView() {
    $('.action').removeClass('active');
    $('.action.itemview').addClass('active');
  }
}
