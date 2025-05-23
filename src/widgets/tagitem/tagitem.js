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

import { inject } from "aurelia-dependency-injection";
import { Annotation } from "Annotation";
import { UserServices } from "UserServices";
import { RecordServices } from "RecordServices";
import { CampaignServices } from "CampaignServices.js";
import { AnnotationServices } from "AnnotationServices.js";
import { ThesaurusServices } from "ThesaurusServices.js";
import { bindable } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { toggleMore } from "utils/Plugin.js";
import { I18N } from "aurelia-i18n";
import * as wheelzoom from "wheelzoom-revived";
import settings from "global.config.js";

@inject(
  UserServices,
  RecordServices,
  CampaignServices,
  EventAggregator,
  AnnotationServices,
  ThesaurusServices,
  "loginPopup",
  I18N,
  "colorPalette"
)
export class Tagitem {
  @bindable prefix = "";

  constructor(
    userServices,
    recordServices,
    campaignServices,
    eventAggregator,
    annotationServices,
    thesaurusServices,
    loginPopup,
    i18n,
    colorPalette
  ) {
    this.i18n = i18n;

    this.colorSet = colorPalette();
    this.colorPalette = null;

    this.ea = eventAggregator;
    this.userServices = userServices;
    this.recordServices = recordServices;
    this.campaignServices = campaignServices;
    this.annotationServices = annotationServices;
    this.thesaurusServices = thesaurusServices;
    this.wheelzoom = window.wheelzoom;

    this.placeholderText = this.i18n.tr("item:tag-search-text");
    this.togglePublishText = this.i18n.tr("item:toggle-publish");
    this.fullImageSrc = "";

    this.suggestionsActive = {};
    this.tagPrefix = {
      "": "",
    };
    this.annotations = {};
    this.geoannotations = [];
    this.colorannotations = [];
    this.imageannotations = [];
    this.pollannotations = [];
    this.commentAnnotations = [];
    this.subtagAnnotations = [];
    this.suggestedAnnotation = {};
    this.suggestionsLoading = false;
    this.suggestedAnnotations = {};
    this.selectedAnnotation = null;
    this.userComment = "";
    this.loadedImagesCount = 0;
    this.compareDisabled = true;
    this.errorTypes = [];
    this.selectingProperty = false;
    this.selectedTerm = {};
    this.selectedProperty = "";
    this.selectedPropertyValue = "";
    this.selectedText = {
      value: "",
      startAt: -1,
      endAt: -1,
    };

    this.userId = "";
    this.lg = loginPopup;
    this.uriRedirect = false;

    this.evsubscr1 = this.ea.subscribe("annotations-created", () => {
      this.reloadAnnotations();
    });
    this.imageTaggingListener = this.ea.subscribe(
      "imagetagging-ranking-added",
      (e) => this.reloadAnnotations()
    );
    this.handleBodyClick = (e) => {
      if (e.target.id != "annotationInput") {
        this.suggestedAnnotations = {};
        this.suggestionsLoading = false;
      }
    };
  }

  get generatorParam() {
    if (this.campaign.username === "colours-catwalk")
      return `${settings.project} ${this.campaign.username},Image Analysis`;
    else return `${settings.project} ${this.campaign.username}`;
  }

  get highlightedText() {
    return window.getSelection();
  }

  get isTextFragmentSelected() {
    if (
      this.highlightedText.toString().length &&
      this.selectedText.value.length
    ) {
      let targetedElement = window.getSelection().focusNode.parentElement.id;
      return targetedElement === "text-fragment-selector";
    }
    return false;
  }

  attached() {
    document.addEventListener("click", this.handleBodyClick);
    toggleMore(".tagBlock");
    toggleMore(".commentBlock");
    toggleMore(".colorBlock");
    toggleMore(".imageBlock");
    toggleMore(".geoBlock");
    toggleMore(".subtagBlock");
  }

  detached() {
    this.evsubscr1.dispose();
    this.imageTaggingListener.dispose();
    document.removeEventListener("click", this.handleBodyClick);
  }

  async activate(params) {
    this.campaign = params.campaign;
    this.recId = params.recId;
    this.record = params.record;
    this.widgetMotivation = params.motivation;
    this.colorPalette = params.campaign
      ? this.campaign.colorPalette
      : this.colorSet;
    this.tagTypes = this.campaign.vocabularyMapping.map(
      (mapping) => mapping.labelName
    );
    this.tagTypes = this.tagTypes.length > 0 ? this.tagTypes : [""];
    this.tagTypes.forEach((type) => {
      this.annotations[type] = [];
    });
    this.errorTypes = params.campaign.validationErrorTypes
      ? params.campaign.validationErrorTypes
      : [];
    if (this.record && this.record.meta) {
      this.targetProperties = this.tagTypes.filter((property) => {
        let recordProperty = this.record.meta[property.toLowerCase()];
        if (recordProperty !== undefined && recordProperty.length) {
          return property;
        }
      });
    }

    if (params.userId) {
      this.userId = params.userId;
    }
    this.loc = window.location.href.split("/")[3];
    try {
      this.colTitle = params.colTitle[0].split(" (")[0];
    } catch (e) {
      this.colTitle = "";
    }
    this.geoannotations.splice(0, this.geoannotations.length);
    this.colorannotations.splice(0, this.colorannotations.length);
    this.imageannotations.splice(0, this.imageannotations.length);
    this.pollannotations.splice(0, this.pollannotations.length);
    this.commentAnnotations.splice(0, this.commentAnnotations.length);
    this.subtagAnnotations.splice(0, this.subtagAnnotations.length);
    this.pollTitle = "";

    if (
      this.userServices.isAuthenticated() &&
      this.userServices.current === null
    ) {
      await this.userServices.reloadCurrentUser();
    }
    await this.getRecordAnnotations(this.recId);
  }

  toggleLoadMore(className) {
    toggleMore(className);
  }

  async reloadAnnotations() {
    this.tagTypes.forEach((type) => {
      this.annotations[type] = [];
    });
    this.geoannotations = [];
    this.colorannotations = [];
    this.imageannotations = [];
    this.pollannotations = [];
    this.commentAnnotations = [];
    this.subtagAnnotations = [];
    await this.getRecordAnnotations(this.recId);
  }

  prefixChanged(geo = false, tagType = "") {
    this.selectedAnnotation = null;
    if (geo || this.campaign.motivation == "GeoTagging") {
      this.getGeoAnnotations(this.tagPrefix[""]);
    } else {
      this.getSuggestedAnnotations(this.tagPrefix[tagType], tagType);
    }
  }

  async getGeoAnnotations(prefix) {
    this.lastRequest = prefix;
    this.suggestionsLoading = true;
    this.suggestedAnnotations[""] = [];
    this.selectedAnnotation = null;
    let self = this;
    let lang = typeof this.loc !== "undefined" ? this.loc : "en";
    await this.thesaurusServices
      .getGeonameSuggestions(prefix, lang)
      .then((res) => {
        self.getGeoSuggestions(res);
      });
  }

  getGeoSuggestions(jData) {
    if (jData == null) {
      // There was a problem parsing search results
      alert("nothing found");
      return;
    }
    var geonames = jData.geonames;
    this.suggestionsActive[""] = true;
    this.suggestedAnnotations[""] = geonames;
    this.suggestionsLoading = false;
  }

  async getSuggestedAnnotations(prefix, tagType, lang = "all") {
    this.lastRequest = prefix;
    this.suggestionsLoading = true;
    lang = typeof this.loc !== "undefined" ? this.loc : "all";
    this.suggestedAnnotations[tagType] = [];
    this.selectedAnnotation = null;
    let self = this;
    let vocabularies =
      this.campaign.vocabularyMapping.length > 0 &&
      !this.campaign.motivation.includes("SubTagging")
        ? this.campaign.vocabularyMapping.find(
            (mapping) => mapping.labelName == tagType
          ).vocabularies
        : this.campaign.vocabularies;
    await this.thesaurusServices
      .getCampaignSuggestions(prefix, vocabularies, lang)
      .then((res) => {
        this.suggestionsActive[tagType] = true;
        self.suggestedAnnotations[tagType] = res.results;
        if (
          self.suggestedAnnotations[tagType].length > 0 &&
          self.suggestedAnnotations[tagType][0].exact
        ) {
          self.selectedAnnotation = self.suggestedAnnotations[tagType][0];
        }
        self.suggestionsLoading = false;
      });
  }

  selectGeoAnnotation(geoid) {
    // If the campaign is inactive do NOT geoannotate
    if (this.campaign.status != "active") {
      toastr.error(this.i18n.tr("item:toastr-inactive"));
      return;
    }
    if (!this.userHasAccessInCampaign()) {
      toastr.error(this.i18n.tr("item:toastr-restricted"));
      return;
    }

    if (this.userServices.isAuthenticated() == false) {
      toastr.error(this.i18n.tr("item:toastr-login"));
      this.lg.call();
      return;
    }

    this.selectedAnnotation = this.suggestedAnnotations[""].find((obj) => {
      return obj.geonameId === geoid;
    });

    const index = this.geoannotations.findIndex(
      (ann) => ann.uri.indexOf(geoid) != -1
    );
    if (index > -1) {
      const ann = this.geoannotations[index];
      this.prefix = "";
      this.selectedAnnotation = null;
      this.suggestionsActive[""] = false;
      this.suggestedAnnotations[""] = [];
      toastr.error(this.i18n.tr("item:toastr-geo"));
      if (!ann.approvedByMe) {
        this.score(ann.dbId, "approved", index, "geo");
      }
    }

    this.suggestedAnnotations[""] = [];

    if (this.selectedAnnotation) {
      let self = this;
      if (!this.hasContributed("all")) {
        this.campaignServices
          .incUserPoints(
            this.campaign.dbId,
            this.userServices.current.dbId,
            "records"
          )
          .catch((error) => {
            console.error("This ERROR occured : ", error);
          });
      }

      this.annotationServices
        .annotateGeoRecord(this.recId, geoid, this.campaign.username)
        .then(() => {
          toastr.success("Annotation added.");
          self.ea.publish("annotations-created", self.record);
          self.ea.publish("geotag-created", this.selectedAnnotation);
          this.campaignServices.incUserPoints(
            this.campaign.dbId,
            this.userServices.current.dbId,
            "created"
          );
          // After annotating, automatically upvote the new annotation
          this.getRecordAnnotations("").then(() => {
            for (var [i, ann] of this.geoannotations.entries()) {
              if (ann.uri && ann.uri.indexOf(geoid) != -1) {
                this.score(ann.dbId, "approved", i, "geo");
                break;
              }
            }
          });

          this.prefix = "";
          this.selectedAnnotation = null;
        })
        .catch((error) => {
          toastr.error(this.i18n.tr("item:toastr-error"));
        });
    }
  }

  selectSuggestedAnnotation(index, tagType) {
    // If the campaign is inactive do NOT validate
    if (this.campaign.status != "active") {
      toastr.error(this.i18n.tr("item:toastr-inactive"));
      return;
    }
    if (!this.userHasAccessInCampaign()) {
      toastr.error(this.i18n.tr("item:toastr-restricted"));
      return;
    }

    if (this.uriRedirect) {
      this.uriRedirect = false;
      this.prefixChanged(false, tagType);
      return;
    }
    if (this.userServices.isAuthenticated() == false) {
      toastr.error(this.i18n.tr("item:toastr-login"));
      this.lg.call();
      return;
    }

    this.selectedAnnotation = this.suggestedAnnotations[tagType].find((obj) => {
      return obj.id === index;
    });
    let lb = this.selectedAnnotation.label;
    for (var [i, ann] of this.annotations[tagType].entries()) {
      if (ann.label.toLowerCase() === lb.toLowerCase()) {
        this.tagPrefix[tagType] = "";
        this.selectedAnnotation = null;
        this.suggestedAnnotations[tagType] = [];
        this.suggestionsActive[tagType] = false;
        toastr.error(this.i18n.tr("item:toastr-existing"));
        if (!ann.approvedByMe) {
          this.score(ann.dbId, "approved", i, "tag");
        }
        return;
      }
    }
    this.suggestedAnnotations[tagType] = [];
    this.suggestionsActive[tagType] = false;
    this.errors = this.selectedAnnotation == null;

    if (!this.errors) {
      let self = this;
      if (!this.hasContributed("all")) {
        this.campaignServices
          .incUserPoints(
            this.campaign.dbId,
            this.userServices.current.dbId,
            "records"
          )
          .catch((error) => {
            console.error("This ERROR occured : ", error);
          });
      }

      let selector = tagType.length > 0 ? tagType : null;
      this.annotationServices
        .annotateRecord(
          this.recId,
          selector,
          this.selectedAnnotation,
          this.campaign.username,
          "Tagging",
          this.loc
        )
        .then(() => {
          toastr.success("Annotation added.");
          self.ea.publish("annotations-created", self.record);
          this.campaignServices.incUserPoints(
            this.campaign.dbId,
            this.userServices.current.dbId,
            "created"
          );
          // After annotating, automatically upvote the new annotation
          var lb = this.selectedAnnotation.label;
          this.getRecordAnnotations("").then(() => {
            for (var [i, ann] of this.annotations[tagType].entries()) {
              if (ann.label.toLowerCase() === lb.toLowerCase()) {
                this.score(ann.dbId, "approved", i, "tag", tagType);
                break;
              }
            }
          });
          this.tagPrefix[tagType] = "";
          this.selectedAnnotation = null;
        })
        .catch((error) => {
          toastr.error(this.i18n.tr("item:toastr-error"));
        });
    }
  }

  async colorAnnotate(color) {
    if (this.campaign.status != "active") {
      toastr.error(this.i18n.tr("item:toastr-inactive"));
      return;
    }
    if (!this.userHasAccessInCampaign()) {
      toastr.error(this.i18n.tr("item:toastr-restricted"));
      return;
    }
    if (this.userServices.isAuthenticated() == false) {
      toastr.error(this.i18n.tr("item:toastr-login"));
      this.lg.call();
      return;
    }

    document.body.style.cursor = "wait";
    let clrs = document.getElementsByClassName("color");
    for (let clr of clrs) {
      clr.style.cursor = "wait";
    }
    let existingAnnotation = this.colorannotations.find(
      (ann) => ann.uri == color.uri
    );
    if (!existingAnnotation) {
      let multiLabels = {};
      Object.keys(color.label).forEach(function (key, index) {
        multiLabels[key] = [color.label[key]];
      });
      let ann = {
        categories: ["colours"],
        label: this.getColorLabel(color.label),
        labels: multiLabels,
        matchedLabel: this.getColorLabel(color.label),
        uri: color.uri,
        vocabulary: this.campaign.username,
      };
      this.annotationServices
        .annotateRecord(
          this.recId,
          null,
          ann,
          this.campaign.username,
          "ColorTagging",
          this.loc
        )
        .then(async () => {
          if (!this.hasContributed("all")) {
            this.campaignServices.incUserPoints(
              this.campaign.dbId,
              this.userServices.current.dbId,
              "records"
            );
          }
          this.campaignServices.incUserPoints(
            this.campaign.dbId,
            this.userServices.current.dbId,
            "created"
          );
          // Clear and reload the colorannotations array
          this.colorannotations.splice(0, this.colorannotations.length);
          await this.getRecordAnnotations(this.recId);
          let newAnnotationIndex = this.colorannotations.findIndex(
            (ann) => ann.uri == color.uri
          );
          await this.score(
            this.colorannotations[newAnnotationIndex].dbId,
            "approved",
            newAnnotationIndex,
            "color"
          );
        })
        .catch((error) => console.error(error));
    } else {
      let existingAnnotationIndex = this.colorannotations.findIndex(
        (ann) => ann.dbId == existingAnnotation.dbId
      );
      if (!this.colorannotations[existingAnnotationIndex].approvedByMe) {
        await this.validate(
          existingAnnotation.dbId,
          "approved",
          existingAnnotationIndex,
          existingAnnotation.approvedByMe,
          existingAnnotation.rejectedByMe,
          "color",
          null
        );
      }
    }

    document.body.style.cursor = "default";
    clrs = document.getElementsByClassName("color");
    for (let clr of clrs) {
      clr.style.cursor = "default";
    }
  }

  // mot has 3 potential values : [tag, geo, color, comment]
  // depending on which widget called the function
  async deleteAnnotation(id, index, mot, tagType) {
    if (this.userServices.isAuthenticated() == false) {
      toastr.error(this.i18n.tr("item:toastr-login"));
      this.lg.call();
      return;
    }
    if (
      confirm(
        "ATTENTION: This action can not be undone!!\nAre you sure you want to delete the selected annotations?"
      )
    ) {
      console.log("Deleting annotations...");
    } else {
      return;
    }

    // Since on annotating, the user automatically also upvotes the annotation,
    // when deleting an annotation, you should also remove the point from upvoting
    await this.unscore(id, "approved", index, mot, tagType);

    this.annotationServices
      .delete(id)
      .then(() => {
        let ann;
        if (mot == "tag") {
          ann = this.annotations[tagType].splice(index, 1);
        } else if (mot == "geo") {
          var lt = this.geoannotations[index];
          ann = this.geoannotations.splice(index, 1);
          if (this.campaign.motivation == "GeoTagging")
            this.ea.publish("geotag-removed", lt.coordinates);
        } else if (mot == "color") {
          ann = this.colorannotations.splice(index, 1);
        } else if (mot == "comment") {
          ann = this.commentAnnotations.splice(index, 1);
        } else if (mot == "subtag") {
          ann = this.subtagAnnotations.splice(index, 1);
        }
        this.reloadAnnotations().then(() => {
          if (this.isCurrentUserCreator()) {
            // Remove one point from each of the upvoters
            for (let upvoter of ann[0].approvedBy) {
              this.campaignServices.decUserPoints(
                this.campaign.dbId,
                upvoter.withCreator,
                "approved"
              );
            }
            // Remove one point from each of the annotators
            for (let annotator of ann[0].createdBy) {
              this.campaignServices.decUserPoints(
                this.campaign.dbId,
                annotator.withCreator,
                "created"
              );
            }
          } else {
            this.campaignServices.decUserPoints(
              this.campaign.dbId,
              this.userServices.current.dbId,
              "created"
            );
            if (!this.hasContributed("all")) {
              this.campaignServices
                .decUserPoints(
                  this.campaign.dbId,
                  this.userServices.current.dbId,
                  "records"
                )
                .catch((error) => {
                  console.error("This ERROR occured : ", error);
                });
            }
          }
        });
      })
      .catch((error) => {
        console.error(error.message);
      });
  }

  async togglePublish(type, index, tagType) {
    var annotations = type + "annotations";
    this.annotationServices
      .markForPublish(
        this[annotations][tagType][index].dbId,
        !this[annotations][tagType][index].publish
      )
      .then((response) => {
        this[annotations][tagType][index].publish =
          !this[annotations][tagType][index].publish;
      })
      .catch((error) => console.error(error));
  }

  async validate(
    annoId,
    annoType,
    index,
    approvedByMe,
    rejectedByMe,
    mot,
    tagType
  ) {
    // If the campaign is inactive do NOT validate
    if (this.campaign.status != "active") {
      toastr.error(this.i18n.tr("item:toastr-inactive"));
      return;
    } else if (!this.userHasAccessInCampaign()) {
      toastr.error(this.i18n.tr("item:toastr-restricted"));
      return;
    } else if (this.userServices.isAuthenticated() == false) {
      toastr.error(this.i18n.tr("item:toastr-login"));
      this.lg.call();
      return;
    }

    if (mot != "color") {
      if (
        (annoType == "approved" && approvedByMe) ||
        (annoType == "rejected" && rejectedByMe)
      ) {
        await this.unscore(annoId, annoType, index, mot, tagType);
      } else if (
        (annoType == "approved" && rejectedByMe) ||
        (annoType == "rejected" && approvedByMe)
      ) {
        let oppositeType = "approved";
        if (annoType == "approved") {
          oppositeType = "rejected";
        }

        await this.unscore(annoId, oppositeType, index, mot, tagType);
        await this.score(annoId, annoType, index, mot, tagType);
      } else {
        await this.score(annoId, annoType, index, mot, tagType);
      }
    } else {
      let annUri = this.colorannotations[index].uri;
      this.colorannotations.forEach(async (ann, i) => {
        if (ann.uri == annUri) {
          if (
            (annoType == "approved" && approvedByMe) ||
            (annoType == "rejected" && rejectedByMe)
          ) {
            await this.unscore(ann.dbId, annoType, i, mot, tagType);
          } else if (
            (annoType == "approved" && rejectedByMe) ||
            (annoType == "rejected" && approvedByMe)
          ) {
            let oppositeType = "approved";
            if (annoType == "approved") {
              oppositeType = "rejected";
            }

            await this.unscore(ann.dbId, oppositeType, i, mot, tagType);
            await this.score(ann.dbId, annoType, i, mot, tagType);
          } else {
            await this.score(ann.dbId, annoType, i, mot, tagType);
          }
        }
      });
    }

    if (mot == "poll") {
      this.ea.publish("pollAnnotationAdded");
    }
  }

  async score(annoId, annoType, index, mot, tagType) {
    if (!this.hasContributed("all")) {
      this.campaignServices
        .incUserPoints(
          this.campaign.dbId,
          this.userServices.current.dbId,
          "records"
        )
        .catch((error) => {
          console.error("This ERROR occured : ", error);
        });
    }

    let obj;
    if (mot == "tag") {
      obj = this.annotations[tagType][index];
    } else if (mot == "geo") {
      obj = this.geoannotations[index];
    } else if (mot == "color") {
      obj = this.colorannotations[index];
    } else if (mot == "poll") {
      obj = this.pollannotations[index];
    } else if (mot == "comment") {
      obj = this.commentAnnotations[index];
    } else if (mot == "subtag") {
      obj = this.subtagAnnotations[index];
    } else {
      return;
    }

    if (annoType == "approved") {
      this.RejectFlag = obj.rejectedByMe;
      this.annotationServices
        .approveObj(annoId, this.campaign.username)
        .then((response) => {
          response["withCreator"] = this.userServices.current.dbId;
          obj.approvedBy.push(response);
          this.annotationServices.getAnnotation(annoId).then((response) => {
            //If after approval the score is equal (approved = rejected) it means that this annotation had bad karma and now must change -> reduce Karma points of the creator
            if (
              response.score.approvedBy != null &&
              response.score.rejectedBy != null
            ) {
              if (this.RejectFlag) {
                if (
                  response.score.approvedBy.length -
                    response.score.rejectedBy.length ==
                    2 ||
                  response.score.approvedBy.length -
                    response.score.rejectedBy.length ==
                    1
                ) {
                  this.campaignServices.decUserPoints(
                    this.campaign.dbId,
                    response.annotators[0].withCreator,
                    "karmaPoints"
                  );
                }
              } else {
                if (
                  response.score.approvedBy.length -
                    response.score.rejectedBy.length ==
                  1
                ) {
                  this.campaignServices.decUserPoints(
                    this.campaign.dbId,
                    response.annotators[0].withCreator,
                    "karmaPoints"
                  );
                }
              }
            }
          });
        })
        .catch((error) => {
          console.error(error.message);
        });

      obj.approvedByMe = true;
      if (obj.rejectedByMe) {
        var i = obj.rejectedBy
          .map(function (e) {
            return e.withCreator;
          })
          .indexOf(this.userServices.current.dbId);
        if (i > -1) {
          obj.rejectedBy.splice(i, 1);
        }
        obj.rejectedByMe = false;
      } else {
        if (
          !this.userServices.isAuthenticated() ||
          (this.userServices.isAuthenticated() &&
            this.userServices.current === null)
        ) {
          await this.userServices.reloadCurrentUser();
        }
        this.campaignServices.incUserPoints(
          this.campaign.dbId,
          this.userServices.current.dbId,
          annoType
        );
      }
    } else if (annoType == "rejected") {
      this.ApproveFlag = obj.approvedByMe;
      let reason = null;
      if (mot === "subtag") {
        let hasRejectionReason =
          this.subtagAnnotations[index].rejectedByMeReason.code.length ||
          this.subtagAnnotations[index].rejectedByMeReason.comment.length;
        reason = hasRejectionReason
          ? this.subtagAnnotations[index].rejectedByMeReason
          : null;
      }
      this.annotationServices
        .rejectObj(annoId, this.campaign.username, reason)
        .then((response) => {
          response["withCreator"] = this.userServices.current.dbId;
          obj.rejectedBy.push(response);

          this.annotationServices.getAnnotation(annoId).then((response) => {
            //If after rejection  rejected - approved = 1 it means that this annotation was ok but now has bad karma and must change -> increase Karma points of the creator
            if (
              response.score.approvedBy != null &&
              response.score.rejectedBy != null
            ) {
              if (this.ApproveFlag) {
                if (
                  response.score.rejectedBy.length -
                    response.score.approvedBy.length ==
                    0 ||
                  response.score.rejectedBy.length -
                    response.score.approvedBy.length ==
                    1
                ) {
                  this.campaignServices.incUserPoints(
                    this.campaign.dbId,
                    response.annotators[0].withCreator,
                    "karmaPoints"
                  );
                }
              } else {
                if (
                  response.score.rejectedBy.length -
                    response.score.approvedBy.length ==
                  0
                ) {
                  this.campaignServices.incUserPoints(
                    this.campaign.dbId,
                    response.annotators[0].withCreator,
                    "karmaPoints"
                  );
                }
              }
            }
          });
        })
        .catch((error) => {
          console.error(error.message);
        });

      obj.rejectedByMe = true;
      if (obj.approvedByMe) {
        var i = obj.approvedBy
          .map(function (e) {
            return e.withCreator;
          })
          .indexOf(this.userServices.current.dbId);
        if (i > -1) {
          obj.approvedBy.splice(i, 1);
        }
        obj.approvedByMe = false;
      } else {
        if (
          !this.userServices.isAuthenticated() ||
          (this.userServices.isAuthenticated() &&
            this.userServices.current === null)
        ) {
          await this.userServices.reloadCurrentUser();
        }
        this.campaignServices.incUserPoints(
          this.campaign.dbId,
          this.userServices.current.dbId,
          annoType
        );
      }
    }
  }

  async unscore(annoId, annoType, index, mot, tagType) {
    let obj;
    if (mot == "tag") {
      obj = this.annotations[tagType][index];
    } else if (mot == "geo") {
      obj = this.geoannotations[index];
    } else if (mot == "color") {
      obj = this.colorannotations[index];
    } else if (mot == "poll") {
      obj = this.pollannotations[index];
    } else if (mot == "comment") {
      obj = this.commentAnnotations[index];
    } else if (mot == "subtag") {
      obj = this.subtagAnnotations[index];
    } else {
      return;
    }
    let validators = [...obj.approvedBy, ...obj.rejectedBy];
    let validatorObj = validators.find(
      (validator) => validator.withCreator === this.userServices.current.dbId
    );
    let unscorePayload = {
      generator: validatorObj.generator,
      confidence: parseFloat(validatorObj.confidence.toFixed(1)),
    };

    if (annoType == "approved") {
      this.annotationServices
        .unscoreObj(annoId, unscorePayload)
        .then((r) => {
          this.annotationServices
            .getAnnotation(annoId)
            .then((response) => {
              //If after approved unscore rejected - approved = 1 it means that this annotation was ok but now has bad karma and must change -> increase Karma points of the creator
              if (
                response.score.approvedBy != null &&
                response.score.rejectedBy != null
              ) {
                if (
                  response.score.rejectedBy.length -
                    response.score.approvedBy.length ==
                  0
                ) {
                  this.campaignServices.incUserPoints(
                    this.campaign.dbId,
                    response.annotators[0].withCreator,
                    "karmaPoints"
                  );
                }
              }
            })
            .catch((error) => {
              console.error("Couldn't find annotation with id:", annoId);
              console.error(error.message);
            });
        })
        .catch((error) => {
          console.error(error.message);
        });

      var i = obj.approvedBy
        .map(function (e) {
          return e.withCreator;
        })
        .indexOf(this.userServices.current.dbId);
      if (i > -1) {
        obj.approvedBy.splice(i, 1);
      }
      obj.approvedByMe = false;

      if (
        !this.userServices.isAuthenticated() ||
        (this.userServices.isAuthenticated() &&
          this.userServices.current === null)
      ) {
        await this.userServices.reloadCurrentUser();
      }

      this.campaignServices.decUserPoints(
        this.campaign.dbId,
        this.userServices.current.dbId,
        annoType
      );
    } else if (annoType == "rejected") {
      this.annotationServices
        .unscoreObj(annoId, unscorePayload)
        .then((r) => {
          this.annotationServices.getAnnotation(annoId).then((response) => {
            //If after rejected unscore the score is equal (approved = rejected) it means that this annotation had bad karma and now must change -> reduce Karma points of the creator
            if (
              response.score.approvedBy != null &&
              response.score.rejectedBy != null
            ) {
              if (
                response.score.approvedBy.length -
                  response.score.rejectedBy.length ==
                1
              ) {
                this.campaignServices.decUserPoints(
                  this.campaign.dbId,
                  response.annotators[0].withCreator,
                  "karmaPoints"
                );
              }
            }
          });
        })
        .catch((error) => {
          console.error(error.message);
        });
      var i = obj.rejectedBy
        .map(function (e) {
          return e.withCreator;
        })
        .indexOf(this.userServices.current.dbId);
      if (i > -1) {
        obj.rejectedBy.splice(i, 1);
      }
      obj.rejectedByMe = false;

      if (
        !this.userServices.isAuthenticated() ||
        (this.userServices.isAuthenticated() &&
          this.userServices.current === null)
      ) {
        await this.userServices.reloadCurrentUser();
      }
      this.campaignServices.decUserPoints(
        this.campaign.dbId,
        this.userServices.current.dbId,
        annoType
      );
    }
    if (!this.hasContributed("all")) {
      this.campaignServices
        .decUserPoints(
          this.campaign.dbId,
          this.userServices.current.dbId,
          "records"
        )
        .catch((error) => {
          console.error("This ERROR occured : ", error);
        });
    }
  }

  async getRecordAnnotations(id) {
    if (this.widgetMotivation == "Polling") {
      await this.recordServices
        .getAnnotations(this.recId, "Polling", this.generatorParam)
        .then((response) => {
          for (var i = 0; i < response.length; i++) {
            if (!this.userServices.current) {
              this.pollannotations.push(new Annotation(response[i], ""));
            } else {
              this.pollannotations.push(
                new Annotation(response[i], this.userServices.current.dbId)
              );
            }
          }
          // Bring first the annotation associated with the spedific collection
          for (var i in this.pollannotations) {
            if (this.pollannotations[i].label == this.colTitle) {
              let temp = this.pollannotations[0];
              this.pollannotations[0] = this.pollannotations[i];
              this.pollannotations[i] = temp;
              break;
            }
          }
          if (this.pollannotations.length > 0) {
            this.pollTitle = this.pollannotations[0].label;
          } else {
            toastr.info(this.i18n.tr("item:toastr-empty"));
          }
        });
    } else if (this.widgetMotivation == "GeoTagging") {
      await this.recordServices
        .getAnnotations(this.recId, "GeoTagging", this.generatorParam)
        .then((response) => {
          this.geoannotations = [];
          for (var i = 0; i < response.length; i++) {
            if (!this.userServices.current) {
              this.geoannotations.push(
                new Annotation(response[i], "", this.loc)
              );
            } else {
              this.geoannotations.push(
                new Annotation(
                  response[i],
                  this.userServices.current.dbId,
                  this.loc
                )
              );
            }
          }
        });
      // Sort the annotations in descending order, based on their score
      this.geoannotations.sort(function (a, b) {
        return b.score - a.score;
      });
    } else if (this.widgetMotivation == "Tagging") {
      await this.recordServices
        .getAnnotations(this.recId, "Tagging", this.generatorParam)
        .then((response) => {
          this.tagTypes.forEach((type) => {
            this.annotations[type] = [];
          });
          for (var i = 0; i < response.length; i++) {
            if (!this.userServices.current) {
              let newAnn = new Annotation(response[i], "", this.loc);
              this.annotations[newAnn.tagType].push(newAnn);
            } else {
              let newAnn = new Annotation(
                response[i],
                this.userServices.current.dbId,
                this.loc
              );
              this.annotations[newAnn.tagType].push(newAnn);
            }
          }
        });
      // Sort the annotations in descending order, based on their score
      this.tagTypes.forEach((type) => {
        this.annotations[type].sort(function (a, b) {
          return b.score - a.score;
        });
      });
    } else if (this.widgetMotivation == "ColorTagging") {
      await this.recordServices
        .getAnnotations(this.recId, "ColorTagging", this.generatorParam)
        .then((response) => {
          this.colorannotations = [];
          for (var i = 0; i < response.length; i++) {
            // Filter the annotations based on the generator
            var flag = false;
            for (var annotator of response[i].annotators) {
              if (
                annotator.generator ==
                  settings.project + " " + this.campaign.username ||
                annotator.generator == "Image Analysis"
              ) {
                flag = true;
                break;
              }
            }
            // If the criterias are met, push the annotation inside the array
            if (flag) {
              if (
                response[i].body.label.en &&
                response[i].body.label.en == "gray"
              ) {
                response[i].body.label.en = ["grey"];
                response[i].body.label.default = ["grey"];
              }
              let userId = this.userServices.current
                ? this.userServices.current.dbId
                : "";
              let newAnn = new Annotation(response[i], userId, this.loc);
              newAnn.cgCreators = `<li>${newAnn.createdBy[0].externalCreatorName}</li>`;
              let existingAnn = this.colorannotations.find(
                (ann) => ann.uri == newAnn.uri
              );
              newAnn.isDuplicate = !!existingAnn;
              if (newAnn.isDuplicate) {
                existingAnn.cgCreators += newAnn.cgCreators;
                newAnn.cgCreators = existingAnn.cgCreators;
              }
              this.colorannotations.push(newAnn);
            }
          }
        });
      // Sort the annotations in descending order, based on their score
      this.colorannotations.sort(function (a, b) {
        return b.score - a.score;
      });
    } else if (this.widgetMotivation == "ImageTagging") {
      await this.recordServices
        .getAnnotations(this.recId, "ImageTagging", this.generatorParam)
        .then((response) => {
          this.imageannotations = [];
          for (var i = 0; i < response.length; i++) {
            if (!this.userServices.current) {
              this.imageannotations.push(
                new Annotation(response[i], "", this.loc, this.generatorParam)
              );
            } else {
              this.imageannotations.push(
                new Annotation(
                  response[i],
                  this.userServices.current.dbId,
                  this.loc,
                  this.generatorParam
                )
              );
            }
          }
        });
      // Sort the annotations in descending order, based on their score
      this.imageannotations.sort(function (a, b) {
        return b.ratedByMeValue - a.ratedByMeValue;
      });
    } else if (this.widgetMotivation == "Commenting") {
      await this.recordServices
        .getAnnotations(this.recId, "Commenting", this.generatorParam)
        .then((response) => {
          this.commentAnnotations = [];
          for (var i = 0; i < response.length; i++) {
            if (!this.userServices.current) {
              this.commentAnnotations.push(
                new Annotation(response[i], "", this.loc)
              );
            } else {
              this.commentAnnotations.push(
                new Annotation(
                  response[i],
                  this.userServices.current.dbId,
                  this.loc
                )
              );
            }
          }
        });
      // Sort the annotations in descending order, based on their score
      this.commentAnnotations.sort(function (a, b) {
        return b.score - a.score;
      });
    } else if (this.widgetMotivation == "SubTagging") {
      await this.recordServices
        .getAnnotations(this.recId, "SubTagging", this.generatorParam)
        .then((response) => {
          this.subtagAnnotations = [];
          for (var i = 0; i < response.length; i++) {
            if (!this.userServices.current) {
              this.subtagAnnotations.push(
                new Annotation(response[i], "", this.loc)
              );
            } else {
              this.subtagAnnotations.push(
                new Annotation(
                  response[i],
                  this.userServices.current.dbId,
                  this.loc
                )
              );
            }
          }
        });
      // Sort the annotations in descending order, based on their score
      this.subtagAnnotations.sort(function (a, b) {
        return b.score - a.score;
      });
    }
  }

  getColorLabel(labelObject) {
    let label = labelObject[this.loc] || labelObject["en"];
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  getStyle(annotation) {
    let color = this.colorPalette.find(
      (color) =>
        color.uri == annotation.uri ||
        color.uri == annotation.uri.replace("http", "https")
    );
    if (color) {
      return color.style || `background: ${color["cssHexCode"]};`;
    }
    return "";
  }

  annotationExists(label) {
    for (var i in this.colorannotations) {
      if (this.colorannotations[i].label == label) {
        return { id: this.colorannotations[i].dbId, index: i };
      }
    }
    return null;
  }

  hasContributed(mot) {
    var tagFlag = false;
    var geoFlag = false;
    var colorFlag = false;
    var pollFlag = false;
    var commFlag = false;
    var subFlag = false;

    for (var i in this.annotations) {
      if (
        this.annotations[i].createdByMe ||
        this.annotations[i].approvedByMe ||
        this.annotations[i].rejectedByMe
      ) {
        tagFlag = true;
        break;
      }
    }
    for (var i in this.geoannotations) {
      if (
        this.geoannotations[i].createdByMe ||
        this.geoannotations[i].approvedByMe ||
        this.geoannotations[i].rejectedByMe
      ) {
        geoFlag = true;
        break;
      }
    }
    for (var i in this.colorannotations) {
      if (
        this.colorannotations[i].createdByMe ||
        this.colorannotations[i].approvedByMe ||
        this.colorannotations[i].rejectedByMe
      ) {
        colorFlag = true;
        break;
      }
    }
    for (var i in this.pollannotations) {
      if (
        this.pollannotations[i].createdByMe ||
        this.pollannotations[i].approvedByMe ||
        this.pollannotations[i].rejectedByMe
      ) {
        pollFlag = true;
        break;
      }
    }
    for (var i in this.commentAnnotations) {
      if (
        this.commentAnnotations[i].createdByMe ||
        this.commentAnnotations[i].approvedByMe ||
        this.commentAnnotations[i].rejectedByMe
      ) {
        commFlag = true;
        break;
      }
    }
    for (var i in this.subtagAnnotations) {
      if (
        this.subtagAnnotations[i].createdByMe ||
        this.subtagAnnotations[i].approvedByMe ||
        this.subtagAnnotations[i].rejectedByMe
      ) {
        subFlag = true;
        break;
      }
    }

    if (mot == "tag") {
      return tagFlag;
    } else if (mot == "geo") {
      return geoFlag;
    } else if (mot == "color") {
      return colorFlag;
    } else if (mot == "poll") {
      return pollFlag;
    } else if (mot == "comment") {
      return commFlag;
    } else if (mot == "subtag") {
      return subFlag;
    } else {
      return tagFlag || geoFlag || colorFlag || pollFlag || commFlag || subFlag;
    }
  }

  hasMotivation(name) {
    return !!this.campaign.motivation.includes(name);
  }

  isCreatedBy(ann) {
    return ann.createdBy[0].withCreator == this.userId;
  }

  isValidatedBy(ann, valType) {
    if (valType == "approved") {
      for (let anno of ann.approvedBy) {
        if (anno.withCreator == this.userId) {
          return true;
        }
      }
    } else if (valType == "rejected") {
      for (let anno of ann.rejectedBy) {
        if (anno.withCreator == this.userId) {
          return true;
        }
      }
    } else if (valType == "all") {
      // If not in user-page, always return TRUE, since there we don't filter the annotation list
      if (this.userId.length == 0) {
        return true;
      }
      for (let anno of ann.approvedBy) {
        if (anno.withCreator == this.userId) {
          return true;
        }
      }
      for (let anno of ann.rejectedBy) {
        if (anno.withCreator == this.userId) {
          return true;
        }
      }
    }
    return false;
  }

  isValidUrl(uri) {
    return uri.startsWith("http");
  }

  goToURI(uri) {
    this.uriRedirect = true;
    window.open(uri);
  }

  clearSearchField(tagType) {
    this.tagPrefix[tagType] = "";
    this.suggestionsActive[tagType] = false;
    this.prefixChanged(false, tagType);
  }

  isCurrentUserCreator() {
    if (this.userServices.current)
      return this.campaign.creators.includes(this.userServices.current.dbId);
    else return false;
  }

  userHasAccessInCampaign() {
    if (!this.userServices.isAuthenticated()) {
      return false;
    }
    if (
      !this.campaign.userGroupIds ||
      this.campaign.userGroupIds.length === 0
    ) {
      return true;
    }
    for (const groupId of this.userServices.current.userGroupsIds) {
      if (this.campaign.userGroupIds.includes(groupId)) {
        return true;
      }
    }
    return false;
  }

  autosizeCommentArea() {
    let area = document.getElementById("user-tag-textarea");
    area.style.cssText = "height:" + area.scrollHeight + "px";
  }

  submitComment() {
    // If the campaign is inactive do NOT annotate
    if (this.campaign.status != "active") {
      toastr.error(this.i18n.tr("item:toastr-inactive"));
      return;
    }
    if (!this.userHasAccessInCampaign()) {
      toastr.error(this.i18n.tr("item:toastr-restricted"));
      return;
    }

    var comment = this.userComment.trim();
    if (comment.length == 0) {
      toastr.error("Your comment can not be empty");
    } else {
      this.annotationServices
        .annotateRecord(
          this.recId,
          null,
          comment,
          this.campaign.username,
          "Commenting",
          this.loc
        )
        .then(() => {
          toastr.success("Annotation added.");
          this.ea.publish("annotations-created", self.record);
          this.campaignServices.incUserPoints(
            this.campaign.dbId,
            this.userServices.current.dbId,
            "created"
          );
          // After annotating, automatically upvote the new annotation
          this.getRecordAnnotations("").then(() => {
            for (var [i, ann] of this.commentAnnotations.entries()) {
              if (ann.label.toLowerCase() === comment.toLowerCase()) {
                this.score(ann.dbId, "approved", i, "comment");
                break;
              }
            }
          });
        })
        .catch((error) => {
          console.error(error);
          toastr.error(this.i18n.tr("item:toastr-error"));
        });
    }

    this.userComment = "";
    let area = document.getElementById("user-tag-textarea");
    area.style.cssText = "height: 28px";
  }

  openComparisonModal() {
    if (this.compareDisabled) {
      return;
    }
    var modal = document.getElementById("comparisonModal");
    var banner = document.getElementById("banner");
    modal.style.display = "block";
    banner.style.display = "none";
  }

  showFullImageModal(uri) {
    this.fullImageSrc = uri;
    var modal = document.getElementById("image-tag-modal");
    var banner = document.getElementById("banner");
    modal.style.display = "block";

    const fullsizeImage = document.getElementById("imagetag-img");
    this.wheelzoom(fullsizeImage, { zoom: 0.25, maxZoom: 10 });
  }

  algoThumbLoaded() {
    this.loadedImagesCount++;
    if (this.loadedImagesCount == 4) {
      this.compareDisabled = false;
    }
  }

  hideFullImageModal() {
    this.wheelzoom.resetAll;
    const fullsizeImage = document.getElementById("imagetag-img");
    fullsizeImage.src = this.fullImageSrc;

    var modal = document.getElementById("image-tag-modal");
    var banner = document.getElementById("banner");
    modal.style.display = "none";
    banner.style.display = "block";
    this.fullImageSrc = "";
  }

  showAnnDescription(annId) {
    let annDescriptionBlock = document.getElementById(`ann-desc-${annId}`);
    if (annDescriptionBlock) {
      annDescriptionBlock.classList.toggle("hide");
    }
  }

  subtagTooltipText(ann) {
    let start = "";
    let middle = "";
    let end = "";
    if (ann.selector.origValue.length) {
      const maxContextSize = 300;
      start = ann.selector.origValue.slice(0, ann.selector.start);
      start =
        start.length > maxContextSize
          ? start.substring(start.length - maxContextSize)
          : start;
      middle = `<strong class='text-yellow'>${ann.selector.origValue.slice(
        ann.selector.start,
        ann.selector.end
      )}</strong>`;
      end = ann.selector.origValue.slice(
        ann.selector.end,
        ann.selector.origValue.length
      );
      end =
        end.length > maxContextSize ? end.substring(0, maxContextSize) : end;
    } else {
      start = ann.selector.prefix;
      middle = `<strong class='text-yellow'>${ann.selector.annotatedValue}</strong>`;
      end = ann.selector.suffix;
    }
    let value = start + middle + end;

    return `<b><u>${ann.selector.property}</u></b><br/>${value}`;
  }

  creatorTooltipText(ann) {
    if (this.isCurrentUserCreator()) {
      return `<b><u>Human Generated</u></b>:<br/>${ann.createdBy[0].username}`;
    } else {
      return "<b>Human Generated</b>";
    }
  }

  generatorTooltipText(ann) {
    return `<b><u>Software Generated</u></b>:<br/>${ann.createdBy[0].externalCreatorName}`;
  }

  isFeedbackAccordionOpen(annoId) {
    return !document
      .getElementById(`collapse-${annoId}`)
      .classList.contains("hide");
  }

  toggleCollapse(annoId) {
    const collapseClasslist = document.getElementById(
      `collapse-${annoId}`
    ).classList;
    const annotationEl = document.getElementById(`annotation-${annoId}`);
    const thumbsDownEl = annotationEl.querySelector(".down");
    const annIsRejectedByMe = this.subtagAnnotations.find(
      (ann) => ann.dbId === annoId
    ).rejectedByMe;
    if (this.isFeedbackAccordionOpen(annoId)) {
      collapseClasslist.add("hide");
      if (!annIsRejectedByMe) {
        thumbsDownEl.classList.remove("active");
      }
    } else {
      collapseClasslist.remove("hide");
      if (!annIsRejectedByMe) {
        thumbsDownEl.classList.add("active");
      }
    }
  }

  selectText() {
    this.selectedText.value = this.highlightedText.toString();
    this.selectedText.startAt = this.highlightedText.baseOffset;
    this.selectedText.endAt = this.highlightedText.extentOffset;
  }

  selectSubTagTerm(term) {
    this.tagPrefix[""] = "";
    this.selectingProperty = true;
    this.selectedTerm = term;
    this.selectedProperty = "";
    this.selectedPropertyValue = "";
    const propertySelector = document.getElementById("propertySelector");
    if (propertySelector) {
      propertySelector.selectedIndex = 0;
    }
    if (this.targetProperties.length === 1) {
      this.selectTargetProperty(this.targetProperties[0]);
    }
  }
  selectTargetProperty(property) {
    this.selectedProperty = property;
    this.selectedPropertyValue = this.record.meta[property.toLowerCase()];
    const propertySelector = document.getElementById("propertySelector");
    if (propertySelector) {
      document.getElementById("propertySelector").blur();
    }
  }

  resetSubAnnotation() {
    this.selectingProperty = false;
    this.selectedTerm = {};
    this.selectedText = {
      value: "",
      startAt: -1,
      endAt: -1,
    };
    this.selectedProperty = "";
    this.selectedPropertyValue = "";
    const propertySelector = document.getElementById("propertySelector");
    if (propertySelector) {
      propertySelector.selectedIndex = 0;
    }
  }

  createSubAnnotation() {
    let selector = {
      origValue: this.selectedPropertyValue,
      origLang: this.record.meta.defaultlanguage.toUpperCase(),
      start: this.selectedText.startAt,
      end: this.selectedText.endAt,
      property: `dc:${this.selectedProperty.toLowerCase()}`,
    };
    this.annotationServices
      .annotateRecord(
        this.recId,
        selector,
        this.selectedTerm,
        this.campaign.username,
        "SubTagging",
        this.loc
      )
      .then(async (response) => {
        toastr.success("Annotation added.");
        this.ea.publish("annotations-created", self.record);
        this.campaignServices.incUserPoints(
          this.campaign.dbId,
          this.userServices.current.dbId,
          "created"
        );
        // After annotating, automatically upvote the new annotation
        await this.getRecordAnnotations(this.recId);
        let i = this.subtagAnnotations.findIndex(
          (ann) => ann.dbId === response.dbId
        );
        this.score(response.dbId, "approved", i, "subtag", "");
        this.resetSubAnnotation();
      });
  }

  async submitRejection(
    annoId,
    annoType,
    index,
    approvedByMe,
    rejectedByMe,
    mot,
    tagType
  ) {
    if (rejectedByMe) {
      await this.validate(
        annoId,
        annoType,
        index,
        approvedByMe,
        true,
        mot,
        tagType
      );
    }
    await this.validate(
      annoId,
      annoType,
      index,
      approvedByMe,
      false,
      mot,
      tagType
    );
    toastr.success(this.i18n.tr("item:toastr-feedback-registered"));
    this.toggleCollapse(annoId);
  }
}
