import { inject } from "aurelia-framework";
import { DialogService } from "aurelia-dialog";
import { Router } from "aurelia-router";
import { I18N } from "aurelia-i18n";
import { EventAggregator } from "aurelia-event-aggregator";
import { Annotation } from "Annotation";
import { UserServices } from "UserServices";
import { RecordServices } from "RecordServices";
import settings from "global.config.js";

const defaultFieldOrder = [
  { fieldName: "dc:title" },
  { fieldName: "dc:description" },
  { fieldName: "dc:type" },
  { fieldName: "dc:subject" },
  { fieldName: "dcterms:medium" },
  { fieldName: "dc:format" },
  { fieldName: "dcterms:temporal" },
  { fieldName: "dcterms:alternative" },
  { fieldName: "dcterms:spatial" },
];

@inject(
  DialogService,
  Router,
  I18N,
  EventAggregator,
  UserServices,
  RecordServices
)
export class ItemMetadataView {
  constructor(
    dialogService,
    router,
    i18n,
    eventAggregator,
    userServices,
    recordServices
  ) {
    this.dialogService = dialogService;
    this.router = router;
    this.i18n = i18n;
    this.ea = eventAggregator;
    this.userServices = userServices;
    this.recordServices = recordServices;

    this.collection = null;
    this.campaign = "";
    this.cname = "";
    this.record = null;

    this.annotations = [];
    this.previous = null;
    this.recId = "";
    this.loc = "";
  }

  activate(params) {
    this.loc = params.loc;
    this.campaign = params.campaign;
    this.record = params.record;
    this.cname = this.campaign.username;
    this.recId = this.record.dbId;
    this.generator = `${settings.project} ${this.campaign.username}`;
    this.ratedByMe = false;

    this.fetchAnnotations();

    this.ratingListener = this.ea.subscribe(
      "rating-added",
      (e) => (this.annotations[e.index].ratedBy = e.ratings)
    );
    this.ratingsModalListener = this.ea.subscribe(
      "open-ratings-modal",
      (index) => this.openRatingsModal(index)
    );
  }

  detached() {
    this.ratingListener.dispose();
    this.ratingsModalListener.dispose();
  }

  get validAnnotations() {
    const valid = this.annotations.filter((ann) => !ann.fieldName);

    let titleAnnotation;
    const titleIndex = valid.findIndex(
      (ann) => typeof ann.tagType === "string" && ann.tagType.endsWith("title")
    );
    if (titleIndex !== -1) {
      titleAnnotation = valid.splice(titleIndex, 1)[0];
    }

    if (titleAnnotation) {
      return [titleAnnotation, ...valid];
    }
    return valid;
  }

  fetchAnnotations() {
    this.annotations = JSON.parse(JSON.stringify(defaultFieldOrder));
    this.campaign.motivation.forEach((motivation) => {
      this.recordServices
        .getAnnotations(this.recId, motivation, this.generator)
        .then((response) => {
          for (let ann of response) {
            let user = this.userServices.current
              ? this.userServices.current.dbId
              : "";
            let annotation = new Annotation(
              ann,
              user,
              this.loc,
              this.generator
            );
            if (user && !this.ratedByMe) {
              if (annotation.ratedBy) {
                this.ratedByMe = !!annotation.ratedBy.find(
                  (rate) => rate.withCreator === this.userServices.current.dbId
                );
              }
            }
            let annotationSelector = annotation.selector.property;
            let annIndex = this.annotations.findIndex(
              (ann) => ann.fieldName == annotationSelector
            );
            if (annIndex < 0) {
              this.annotations.push(annotation);
            } else {
              this.annotations.splice(annIndex, 0, annotation);
            }
          }
        })
        .catch((error) => console.error(error.message));
    });
  }

  openRatingsModal(annotationIndex) {
    this.dialogService.open({
      viewModel: PLATFORM.moduleName("widgets/ratingsdialog/ratingsdialog"),
      overlayDismiss: false,
      model: {
        campaign: this.campaign,
        annotation: this.validAnnotations[annotationIndex],
      },
    });
  }

  quickView() {
    $(".action").removeClass("active");
    $(".action.itemview").addClass("active");
  }
}
