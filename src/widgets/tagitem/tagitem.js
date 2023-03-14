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


import { inject } from 'aurelia-dependency-injection';
import { Annotation } from 'Annotation';
import { UserServices } from 'UserServices';
import { RecordServices } from 'RecordServices';
import { CampaignServices } from 'CampaignServices.js';
import { AnnotationServices } from 'AnnotationServices.js';
import { ThesaurusServices } from 'ThesaurusServices.js';
import { bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { toggleMore } from 'utils/Plugin.js';
import { I18N } from 'aurelia-i18n';
import settings from 'global.config.js';

@inject(UserServices, RecordServices, CampaignServices, EventAggregator, AnnotationServices, ThesaurusServices, 'loginPopup', I18N, 'colorPalette')
export class Tagitem {

  @bindable prefix = '';

  constructor(userServices, recordServices, campaignServices, eventAggregator, annotationServices, thesaurusServices, loginPopup, i18n, colorPalette) {
    this.i18n = i18n;

    this.colorSet = colorPalette();
    this.colorPalette = null;

    this.ea = eventAggregator;
    this.userServices = userServices;
    this.recordServices = recordServices;
    this.campaignServices = campaignServices;
    this.annotationServices = annotationServices;
    this.thesaurusServices = thesaurusServices;

    this.placeholderText = this.i18n.tr('item:tag-search-text');
    this.togglePublishText = this.i18n.tr('item:toggle-publish');

    this.suggestionsActive = {};
    this.tagPrefix = {};
    this.annotations = {};
    this.geoannotations = [];
    this.colorannotations = [];
    this.pollannotations = [];
    this.commentAnnotations = [];
    this.suggestedAnnotation = {};
    this.suggestionsLoading = false;
    this.suggestedAnnotations = {};
    this.selectedAnnotation = null;
    this.userComment = '';

    this.userId = '';
    this.lg = loginPopup;
    this.uriRedirect = false;

    this.evsubscr1 = this.ea.subscribe('annotations-created', () => { this.reloadAnnotations() });
    this.handleBodyClick = e => {
      if (e.target.id != "annotationInput") {
        this.suggestedAnnotations = {};
        this.suggestionsLoading = false;
      }
    };
  }

  get generatorParam() {
    if (this.campaign.username === 'colours-catwalk')
      return `${settings.project} ${this.campaign.username},Image Analysis`;
    else
      return `${settings.project} ${this.campaign.username}`;
  }

  attached() {
    document.addEventListener('click', this.handleBodyClick);
    toggleMore(".tagBlock");
    toggleMore(".commentBlock");
    toggleMore(".colorBlock");
    toggleMore(".geoBlock");
  }

  detached() {
    this.evsubscr1.dispose();
    document.removeEventListener('click', this.handleBodyClick);
  }

  async activate(params) {
    this.campaign = params.campaign;
    this.recId = params.recId;
    this.widgetMotivation = params.motivation;
    this.colorPalette = params.campaign ? this.campaign.colorPallete : this.colorSet;
    this.tagTypes = this.campaign.vocabularyMapping.map(mapping => mapping.labelName);
    this.tagTypes = this.tagTypes.length > 0 ? this.tagTypes : [''];
    this.tagTypes.forEach(type => {
      this.annotations[type] = [];
    });

    if (params.userId) {
      this.userId = params.userId;
    }
    this.loc = window.location.href.split('/')[3];
    try {
      this.colTitle = params.colTitle[0].split(' (')[0];
    } catch (e) {
      this.colTitle = "";
    }
    this.geoannotations.splice(0, this.geoannotations.length);
    this.colorannotations.splice(0, this.colorannotations.length);
    this.pollannotations.splice(0, this.pollannotations.length);
    this.commentAnnotations.splice(0, this.commentAnnotations.length);
    this.pollTitle = "";

    if (this.userServices.isAuthenticated() && this.userServices.current === null) {
      await this.userServices.reloadCurrentUser();
    }
    await this.getRecordAnnotations(this.recId);
  }

  toggleLoadMore(className) {
    toggleMore(className);
  }

  async reloadAnnotations() {
    this.tagTypes.forEach(type => {
      this.annotations[type] = [];
    });
    this.geoannotations = [];
    this.colorannotations = [];
    this.pollannotations = [];
    this.commentAnnotations = [];
    await this.getRecordAnnotations(this.recId);
  }

  prefixChanged(geo = false, tagType = "") {
    // if (this.tagPrefix[tagType] === '') {
    //   this.suggestedAnnotations[tagType] = [];
    //   this.suggestionsActive[tagType] = false;
    //   return;
    // }
    this.selectedAnnotation = null;
    if (geo || this.campaign.motivation == 'GeoTagging') {
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
    let lang = typeof this.loc !== 'undefined' ? this.loc : 'en';
    await this.thesaurusServices.getGeonameSuggestions(prefix, lang)
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
    var html = '';
    var geonames = jData.geonames;
    this.suggestionsActive[""] = true;
    this.suggestedAnnotations[""] = geonames;
    /*if (self.suggestedAnnotations.length > 0 && self.suggestedAnnotations[0].exact) {
  self.selectedAnnotation = self.suggestedAnnotations[0];
  }*/
    this.suggestionsLoading = false;
  }

  async getSuggestedAnnotations(prefix, tagType, lang = "all") {
    this.lastRequest = prefix;
    this.suggestionsLoading = true;
    lang = typeof this.loc !== 'undefined' ? this.loc : 'all';
    this.suggestedAnnotations[tagType] = [];
    this.selectedAnnotation = null;
    let self = this;
    let vocabularies = this.campaign.vocabularyMapping.length > 0 ? this.campaign.vocabularyMapping.find(mapping => mapping.labelName == tagType).vocabularies : this.campaign.vocabularies;
    await this.thesaurusServices.getCampaignSuggestions(prefix, vocabularies, lang).then((res) => {
      // if (res.request === self.lastRequest) {
        //this.suggestedAnnotations = res.results.slice(0, 20);
        this.suggestionsActive[tagType] = true;
        self.suggestedAnnotations[tagType] = res.results;
        if (self.suggestedAnnotations[tagType].length > 0 && self.suggestedAnnotations[tagType][0].exact) {
          self.selectedAnnotation = self.suggestedAnnotations[tagType][0];
        }
        self.suggestionsLoading = false;
      // }
    });
  }

  selectGeoAnnotation(geoid) {
    // If the campaign is inactive do NOT geoannotate
    if (this.campaign.status != 'active') {
      toastr.error(this.i18n.tr('item:toastr-inactive'));
      return;
    }
    if (!this.userHasAccessInCampaign()) {
      toastr.error(this.i18n.tr('item:toastr-restricted'));
      return;
    }

    if (this.userServices.isAuthenticated() == false) {
      toastr.error(this.i18n.tr('item:toastr-login'));
      this.lg.call();
      return;
    }

    this.selectedAnnotation = this.suggestedAnnotations[""].find(obj => {
      return obj.geonameId === geoid
    });
    for (var [i, ann] of this.geoannotations.entries()) {
      if (ann.uri && ann.uri.indexOf(geoid) != -1) {
        this.prefix = "";
        this.selectedAnnotation = null;
        this.suggestionsActive[""] = false;
        this.suggestedAnnotations[""] = [];
        toastr.error(this.i18n.tr('item:toastr-geo'));
        if (!ann.approvedByMe) {
          this.score(ann.dbId, 'approved', i, 'geo');
        }
        return;
      }
    }
    this.suggestedAnnotations[""] = [];
    this.errors = this.selectedAnnotation == null;

    if (!this.errors) {
      let self = this;
      if (!this.hasContributed('all')) {
        this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records')
          .catch((error) => {
            console.error("This ERROR occured : ", error);
          });
      }

      this.annotationServices.annotateGeoRecord(this.recId, geoid, this.campaign.username)
        .then(() => {
          toastr.success('Annotation added.');
          self.ea.publish('annotations-created', self.record);
          self.ea.publish('geotag-created', this.selectedAnnotation);
          this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'created');
          // After annotating, automatically upvote the new annotation
          this.getRecordAnnotations('').then(() => {
            for (var [i, ann] of this.geoannotations.entries()) {
              if (ann.uri && ann.uri.indexOf(geoid) != -1) {
                this.score(ann.dbId, 'approved', i, 'geo');
                break;
              }
            }
          });
          this.prefix = "";
          this.selectedAnnotation = null;
        }).catch((error) => {
          toastr.error(this.i18n.tr('item:toastr-error'));
        });
    }
  }

  selectSuggestedAnnotation(index, tagType) {
    // If the campaign is inactive do NOT validate
    if (this.campaign.status != 'active') {
      toastr.error(this.i18n.tr('item:toastr-inactive'));
      return;
    }
    if (!this.userHasAccessInCampaign()) {
      toastr.error(this.i18n.tr('item:toastr-restricted'));
      return;
    }

    if (this.uriRedirect) {
      this.uriRedirect = false;
      this.prefixChanged(false, tagType);
      return;
    }
    if (this.userServices.isAuthenticated() == false) {
      toastr.error(this.i18n.tr('item:toastr-login'));
      this.lg.call();
      return;
    }

    this.selectedAnnotation = this.suggestedAnnotations[tagType].find(obj => {
      return obj.id === index
    });
    let lb = this.selectedAnnotation.label;
    for (var [i, ann] of this.annotations[tagType].entries()) {
      if (ann.label.toLowerCase() === lb.toLowerCase()) {
        this.tagPrefix[tagType] = "";
        this.selectedAnnotation = null;
        this.suggestedAnnotations[tagType] = [];
        this.suggestionsActive[tagType] = false;
        toastr.error(this.i18n.tr('item:toastr-existing'));
        if (!ann.approvedByMe) {
          this.score(ann.dbId, 'approved', i, 'tag');
        }
        return;
      }
    }
    this.suggestedAnnotations[tagType] = [];
    this.suggestionsActive[tagType] = false;
    this.errors = this.selectedAnnotation == null;

    if (!this.errors) {
      let self = this;
      if (!this.hasContributed('all')) {
        this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records')
          .catch((error) => {
            console.error("This ERROR occured : ", error);
          });
      }

      let selector = (tagType.length > 0) ? tagType : null;
      this.annotationServices.annotateRecord(this.recId, selector, this.selectedAnnotation, this.campaign.username, 'Tagging', this.loc).then(() => {
        toastr.success('Annotation added.');
        self.ea.publish('annotations-created', self.record);
        this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'created');
        // After annotating, automatically upvote the new annotation
        var lb = this.selectedAnnotation.label;
        this.getRecordAnnotations('').then(() => {
          for (var [i, ann] of this.annotations[tagType].entries()) {
            if (ann.label.toLowerCase() === lb.toLowerCase()) {
              this.score(ann.dbId, 'approved', i, 'tag', tagType);
              break;
            }
          }
        });
        this.tagPrefix[tagType] = "";
        this.selectedAnnotation = null;
      }).catch((error) => {
        toastr.error(this.i18n.tr('item:toastr-error'));
      });
    }
  }

  async colorAnnotate(color) {
    if (this.campaign.status != 'active') {
      toastr.error(this.i18n.tr('item:toastr-inactive'));
      return;
    }
    if (!this.userHasAccessInCampaign()) {
      toastr.error(this.i18n.tr('item:toastr-restricted'));
      return;
    }
    if (this.userServices.isAuthenticated() == false) {
      toastr.error(this.i18n.tr('item:toastr-login'));
      this.lg.call();
      return;
    }

    document.body.style.cursor = 'wait';
    let clrs = document.getElementsByClassName("color");
    for (let clr of clrs) {
      clr.style.cursor = 'wait';
    }
    let existingAnnotation = this.colorannotations.find(ann => ann.uri == color.uri);
    if (!existingAnnotation) {
      let multiLabels = {};
      Object.keys(color.label).forEach(function(key, index) {
        multiLabels[key] = [color.label[key]];
      });
      let ann = {
        categories: [ "colours" ],
        label: this.getColorLabel(color.label),
        labels: multiLabels,
        matchedLabel: this.getColorLabel(color.label),
        uri: color.uri,
        vocabulary: this.campaign.username
      };
      this.annotationServices.annotateRecord(this.recId, null, ann, this.campaign.username, 'ColorTagging', this.loc)
        .then(async () => {
          if (!this.hasContributed('all')) {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records');
          }
          this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'created');
          // Clear and reload the colorannotations array
          this.colorannotations.splice(0, this.colorannotations.length);
          await this.getRecordAnnotations(this.recId);
          let newAnnotationIndex = this.colorannotations.findIndex(ann => ann.uri == color.uri);
          await this.score(this.colorannotations[newAnnotationIndex].dbId, 'approved', newAnnotationIndex, 'color');
        })
        .catch(error => console.error(error));
    }
    else {
      let existingAnnotationIndex = this.colorannotations.findIndex(ann => ann.dbId == existingAnnotation.dbId);
      if (!this.colorannotations[existingAnnotationIndex].approvedByMe) {
        await this.validate(existingAnnotation.dbId, 'approved', existingAnnotationIndex, existingAnnotation.approvedByMe, existingAnnotation.rejectedByMe, 'color', null);
      }
    }

    document.body.style.cursor = 'default';
    clrs = document.getElementsByClassName("color");
    for (let clr of clrs) {
      clr.style.cursor = 'default';
    }
  }

  // mot has 3 potential values : [tag, geo, color, comment]
  // depending on which widget called the function
  deleteAnnotation(id, index, mot, tagType) {
    if (this.userServices.isAuthenticated() == false) {
      toastr.error(this.i18n.tr('item:toastr-login'));
      this.lg.call();
      return;
    }
    if (this.isCurrentUserCreator()) {
      if (confirm('ATTENTION: This action can not be undone!!\nAre you sure you want to delete the selected annotations?')) {
        console.log("Deleting annotations...");
      } else {
        return;
      }
    } else {
      // Since on annotating, the user automatically also upvotes the annotation,
      // when deleting an annotation, you should also remove the point from upvoting
      this.unscore(id, 'approved', index, mot);
    }

    this.annotationServices.delete(id).then(() => {
      let ann;
      if (mot == 'tag') {
        ann = this.annotations[tagType].splice(index, 1);
      }
      else if (mot == 'geo') {
        var lt = this.geoannotations[index];
        ann = this.geoannotations.splice(index, 1);
        if (this.campaign.motivation == 'GeoTagging')
          this.ea.publish('geotag-removed', lt.coordinates);
      }
      else if (mot == 'color') {
        ann = this.colorannotations.splice(index, 1);
      }
      else if (mot == 'comment') {
        ann = this.commentAnnotations.splice(index, 1);
      }
      this.reloadAnnotations().then(() => {
        if (this.isCurrentUserCreator()) {
          // Remove one point from each of the upvoters
          for (let upvoter of ann[0].approvedBy) {
            this.campaignServices.decUserPoints(this.campaign.dbId, upvoter.withCreator, 'approved');
          }
          // Remove one point from each of the annotators
          for (let annotator of ann[0].createdBy) {
            this.campaignServices.decUserPoints(this.campaign.dbId, annotator.withCreator, 'created');
          }
        } else {
          this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'created');
          if (!this.hasContributed('all')) {
            this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records')
              .catch((error) => {
                console.error("This ERROR occured : ", error);
              });
          }
        }
      });
    }).catch(error => {
      console.error(error.message);
    });
  }

  async togglePublish(type, index, tagType) {
    var annotations = type + 'annotations';
    this.annotationServices.markForPublish(this[annotations][tagType][index].dbId, !this[annotations][tagType][index].publish)
      .then(response => {
        this[annotations][tagType][index].publish = !this[annotations][tagType][index].publish;
      })
      .catch(error => console.error(error));
  }

  async validate(annoId, annoType, index, approvedByMe, rejectedByMe, mot, tagType) {
    // If the campaign is inactive do NOT validate
    if (this.campaign.status != 'active') {
      toastr.error(this.i18n.tr('item:toastr-inactive'));
      return;
    }
    if (!this.userHasAccessInCampaign()) {
      toastr.error(this.i18n.tr('item:toastr-restricted'));
      return;
    }

    if (this.userServices.isAuthenticated() == false) {
      toastr.error(this.i18n.tr('item:toastr-login'));
      this.lg.call();
      return;
    }

    if (mot != 'color') {
      if (((annoType == 'approved') && approvedByMe) || ((annoType == 'rejected') && rejectedByMe)) {
        await this.unscore(annoId, annoType, index, mot, tagType);
      }
      else if(((annoType == 'approved') && rejectedByMe) || ((annoType == 'rejected') && approvedByMe)){
        let oppositeType = 'approved';
        if(annoType == 'approved'){
          oppositeType = 'rejected'
        }

        await this.unscore(annoId, oppositeType, index, mot, tagType);
        await this.score(annoId, annoType, index, mot, tagType);
      }
      else {
        await this.score(annoId, annoType, index, mot, tagType);
      }
    }
    else {
      let annUri = this.colorannotations[index].uri;
      this.colorannotations.forEach(async (ann, i) => {
        if (ann.uri == annUri) {
          if (((annoType == 'approved') && approvedByMe) || ((annoType == 'rejected') && rejectedByMe)) {
            await this.unscore(ann.dbId, annoType, i, mot, tagType);
          }
          else if(((annoType == 'approved') && rejectedByMe) || ((annoType == 'rejected') && approvedByMe)){
            let oppositeType = 'approved';
            if(annoType == 'approved'){
              oppositeType = 'rejected'
            }
            
            await this.unscore(ann.dbId, oppositeType, i, mot, tagType);
            await this.score(ann.dbId, annoType, i, mot, tagType);
          }
          else {
            await this.score(ann.dbId, annoType, i, mot, tagType);
          }
        }
      });
    }

    if (mot == 'poll') {
      this.ea.publish('pollAnnotationAdded');
    }
  }

  async score(annoId, annoType, index, mot, tagType) {
    if (!this.hasContributed('all')) {
      this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records')
        .catch((error) => {
          console.error("This ERROR occured : ", error);
        });
    }

    if (annoType == 'approved') {
      //this.annotationServices.approve(annoId);
      if (mot == 'tag') {
        this.RejectFlag = this.annotations[tagType][index].rejectedByMe;
      }
      else if (mot == 'geo') {
        this.RejectFlag = this.geoannotations[index].rejectedByMe;
      }
      else if (mot == 'color') {
        this.RejectFlag = this.colorannotations[index].rejectedByMe;
      }
      else if (mot == 'poll') {
        this.RejectFlag = this.pollannotations[index].rejectedByMe;
      }
      else if (mot == 'comment') {
        this.RejectFlag = this.commentAnnotations[index].rejectedByMe;
      }

      this.annotationServices.approveObj(annoId, this.campaign.username).then(response => {
        response['withCreator'] = this.userServices.current.dbId;
        if (mot == 'tag') {
          this.annotations[tagType][index].approvedBy.push(response);
        }
        else if (mot == 'geo') {
          this.geoannotations[index].approvedBy.push(response);
        }
        else if (mot == 'color') {
          this.colorannotations[index].approvedBy.push(response);
        }
        else if (mot == 'poll') {
          this.pollannotations[index].approvedBy.push(response);
        }
        else if (mot == 'comment') {
          this.commentAnnotations[index].approvedBy.push(response);
        }

        this.annotationServices.getAnnotation(annoId).then(response => {
          //If after approval the score is equal (approved = rejected) it means that this annotation had bad karma and now must change -> reduce Karma points of the creator
          if (response.score.approvedBy != null && response.score.rejectedBy != null) {
            if (this.RejectFlag) {
              if ((response.score.approvedBy.length - response.score.rejectedBy.length == 2) || (response.score.approvedBy.length - response.score.rejectedBy.length == 1)) {
                this.campaignServices.decUserPoints(this.campaign.dbId, response.annotators[0].withCreator, "karmaPoints")
              }
            }
            else {
              if (response.score.approvedBy.length - response.score.rejectedBy.length == 1) {
                this.campaignServices.decUserPoints(this.campaign.dbId, response.annotators[0].withCreator, "karmaPoints")
              }
            }
          }
        });

      }).catch(error => {
        console.error(error.message);
      });

      if (mot == 'tag') {
        this.annotations[tagType][index].approvedByMe = true;
        if (this.annotations[tagType][index].rejectedByMe) {
          var i = this.annotations[tagType][index].rejectedBy.map(function (e) {
            return e.withCreator;
          }).indexOf(this.userServices.current.dbId);
          if (i > -1) {
            this.annotations[tagType][index].rejectedBy.splice(i, 1);
          }
          this.annotations[tagType][index].rejectedByMe = false;
        } else {
          if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
            await this.userServices.reloadCurrentUser();
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          } else {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          }
        }
      }
      else if (mot == 'geo') {
        this.geoannotations[index].approvedByMe = true;
        if (this.geoannotations[index].rejectedByMe) {
          var i = this.geoannotations[index].rejectedBy.map(function (e) {
            return e.withCreator;
          }).indexOf(this.userServices.current.dbId);
          if (i > -1) {
            this.geoannotations[index].rejectedBy.splice(i, 1);
          }
          this.geoannotations[index].rejectedByMe = false;
        } else {
          if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
            await this.userServices.reloadCurrentUser();
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          } else {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          }
        }
      }
      else if (mot == 'color') {
        this.colorannotations[index].approvedByMe = true;
        if (this.colorannotations[index].rejectedByMe) {
          var i = this.colorannotations[index].rejectedBy.map(function (e) {
            return e.withCreator;
          }).indexOf(this.userServices.current.dbId);
          if (i > -1) {
            this.colorannotations[index].rejectedBy.splice(i, 1);
          }
          this.colorannotations[index].rejectedByMe = false;
        } else {
          if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
            await this.userServices.reloadCurrentUser();
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          } else {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          }
        }
      }
      else if (mot == 'poll') {
        this.pollannotations[index].approvedByMe = true;
        if (this.pollannotations[index].rejectedByMe) {
          var i = this.pollannotations[index].rejectedBy.map(function (e) {
            return e.withCreator;
          }).indexOf(this.userServices.current.dbId);
          if (i > -1) {
            this.pollannotations[index].rejectedBy.splice(i, 1);
          }
          this.pollannotations[index].rejectedByMe = false;
        } else {
          if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
            await this.userServices.reloadCurrentUser();
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          } else {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          }
        }
      }
      else if (mot == 'comment') {
        this.commentAnnotations[index].approvedByMe = true;
        if (this.commentAnnotations[index].rejectedByMe) {
          var i = this.commentAnnotations[index].rejectedBy.map(function (e) {
            return e.withCreator;
          }).indexOf(this.userServices.current.dbId);
          if (i > -1) {
            this.commentAnnotations[index].rejectedBy.splice(i, 1);
          }
          this.commentAnnotations[index].rejectedByMe = false;
        } else {
          if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
            await this.userServices.reloadCurrentUser();
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          } else {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          }
        }
      }
    }

    if (annoType == 'rejected') {
      //this.annotationServices.reject(annoId);
      if (mot == 'tag') {
        this.ApproveFlag = this.annotations[tagType][index].approvedByMe;
      }
      else if (mot == 'geo') {
        this.ApproveFlag = this.geoannotations[index].approvedByMe;
      }
      else if (mot == 'color') {
        this.ApproveFlag = this.colorannotations[index].approvedByMe;
      }
      else if (mot == 'poll') {
        this.ApproveFlag = this.pollannotations[index].approvedByMe;
      }
      else if (mot == 'comment') {
        this.ApproveFlag = this.commentAnnotations[index].approvedByMe;
      }

      this.annotationServices.rejectObj(annoId, this.campaign.username).then(response => {
        response['withCreator'] = this.userServices.current.dbId;
        if (mot == 'tag') {
          this.annotations[tagType][index].rejectedBy.push(response);
        }
        else if (mot == 'geo') {
          this.geoannotations[index].rejectedBy.push(response);
        }
        else if (mot == 'color') {
          this.colorannotations[index].rejectedBy.push(response);
        }
        else if (mot == 'poll') {
          this.pollannotations[index].rejectedBy.push(response);
        }
        else if (mot == 'comment') {
          this.commentAnnotations[index].rejectedBy.push(response);
        }

        this.annotationServices.getAnnotation(annoId).then(response => {
          //If after rejection  rejected - approved = 1 it means that this annotation was ok but now has bad karma and must change -> increase Karma points of the creator
          if (response.score.approvedBy != null && response.score.rejectedBy != null) {
            if (this.ApproveFlag) {
              if ((response.score.rejectedBy.length - response.score.approvedBy.length == 0) || (response.score.rejectedBy.length - response.score.approvedBy.length == 1)) {
                this.campaignServices.incUserPoints(this.campaign.dbId, response.annotators[0].withCreator, "karmaPoints")
              }
            }
            else {
              if (response.score.rejectedBy.length - response.score.approvedBy.length == 0) {
                this.campaignServices.incUserPoints(this.campaign.dbId, response.annotators[0].withCreator, "karmaPoints")
              }
            }
          }

        });

      }).catch(error => {
        console.error(error.message);
      });
      if (mot == 'tag') {
        this.annotations[tagType][index].rejectedByMe = true;
        if (this.annotations[tagType][index].approvedByMe) {
          var i = this.annotations[tagType][index].approvedBy.map(function (e) {
            return e.withCreator;
          }).indexOf(this.userServices.current.dbId);
          if (i > -1) {
            this.annotations[tagType][index].approvedBy.splice(i, 1);
          }
          this.annotations[tagType][index].approvedByMe = false;
        } else {
          if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
            await this.userServices.reloadCurrentUser();
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          } else {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          }
        }
      }
      else if (mot == 'geo') {
        this.geoannotations[index].rejectedByMe = true;
        if (this.geoannotations[index].approvedByMe) {
          var i = this.geoannotations[index].approvedBy.map(function (e) {
            return e.withCreator;
          }).indexOf(this.userServices.current.dbId);
          if (i > -1) {
            this.geoannotations[index].approvedBy.splice(i, 1);
          }
          this.geoannotations[index].approvedByMe = false;
        } else {
          if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
            await this.userServices.reloadCurrentUser();
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          } else {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          }
        }
      }
      else if (mot == 'color') {
        this.colorannotations[index].rejectedByMe = true;
        if (this.colorannotations[index].approvedByMe) {
          var i = this.colorannotations[index].approvedBy.map(function (e) {
            return e.withCreator;
          }).indexOf(this.userServices.current.dbId);
          if (i > -1) {
            this.colorannotations[index].approvedBy.splice(i, 1);
          }
          this.colorannotations[index].approvedByMe = false;
        } else {
          if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
            await this.userServices.reloadCurrentUser();
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          } else {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          }
        }
      }
      else if (mot == 'poll') {
        this.pollannotations[index].rejectedByMe = true;
        if (this.pollannotations[index].approvedByMe) {
          var i = this.pollannotations[index].approvedBy.map(function (e) {
            return e.withCreator;
          }).indexOf(this.userServices.current.dbId);
          if (i > -1) {
            this.pollannotations[index].approvedBy.splice(i, 1);
          }
          this.pollannotations[index].approvedByMe = false;
        } else {
          if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
            await this.userServices.reloadCurrentUser();
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          } else {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          }
        }
      }
      else if (mot == 'comment') {
        this.commentAnnotations[index].rejectedByMe = true;
        if (this.commentAnnotations[index].approvedByMe) {
          var i = this.commentAnnotations[index].approvedBy.map(function (e) {
            return e.withCreator;
          }).indexOf(this.userServices.current.dbId);
          if (i > -1) {
            this.commentAnnotations[index].approvedBy.splice(i, 1);
          }
          this.commentAnnotations[index].approvedByMe = false;
        } else {
          if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
            await this.userServices.reloadCurrentUser();
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          } else {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          }
        }
      }
    }
  }

  async unscore(annoId, annoType, index, mot, tagType) {
    if (annoType == 'approved') {
      //this.annotationServices.unscore(annoId);
      this.annotationServices.unscoreObj(annoId).then(response1 => {
        this.annotationServices.getAnnotation(annoId).then(response => {
          //If after approved unscore rejected - approved = 1 it means that this annotation was ok but now has bad karma and must change -> increase Karma points of the creator
          if (response.score.approvedBy != null && response.score.rejectedBy != null) {
            if (response.score.rejectedBy.length - response.score.approvedBy.length == 0) {
              this.campaignServices.incUserPoints(this.campaign.dbId, response.annotators[0].withCreator, "karmaPoints")
            }
          }
        })
          .catch(error => {
            console.error("Couldn't find annotation with id:", annoId);
            console.error(error.message);
          });
      }).catch(error => {
        console.error(error.message);
      });
      if (mot == 'tag') {
        var i = this.annotations[tagType][index].approvedBy.map(function (e) {
          return e.withCreator;
        }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.annotations[tagType][index].approvedBy.splice(i, 1);
        }
        this.annotations[tagType][index].approvedByMe = false;
      }
      else if (mot == 'geo') {
        var i = this.geoannotations[index].approvedBy.map(function (e) {
          return e.withCreator;
        }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.geoannotations[index].approvedBy.splice(i, 1);
        }
        this.geoannotations[index].approvedByMe = false;
      }
      else if (mot == 'color') {
        var i = this.colorannotations[index].approvedBy.map(function (e) {
          return e.withCreator;
        }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.colorannotations[index].approvedBy.splice(i, 1);
        }
        this.colorannotations[index].approvedByMe = false;
      }
      else if (mot == 'poll') {
        var i = this.pollannotations[index].approvedBy.map(function (e) {
          return e.withCreator;
        }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.pollannotations[index].approvedBy.splice(i, 1);
        }
        this.pollannotations[index].approvedByMe = false;
      }
      else if (mot == 'comment') {
        var i = this.commentAnnotations[index].approvedBy.map(function (e) {
          return e.withCreator;
        }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.commentAnnotations[index].approvedBy.splice(i, 1);
        }
        this.commentAnnotations[index].approvedByMe = false;
      }

      if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
        await this.userServices.reloadCurrentUser();
        this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
      } else {
        this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
      }
    }

    if (annoType == 'rejected') {
      //this.annotationServices.unscore(annoId);
      this.annotationServices.unscoreObj(annoId).then(response => {
        this.annotationServices.getAnnotation(annoId).then(response => {
          //If after rejected unscore the score is equal (approved = rejected) it means that this annotation had bad karma and now must change -> reduce Karma points of the creator
          if (response.score.approvedBy != null && response.score.rejectedBy != null) {
            if (response.score.approvedBy.length - response.score.rejectedBy.length == 1) {
              this.campaignServices.decUserPoints(this.campaign.dbId, response.annotators[0].withCreator, "karmaPoints")
            }
          }
        });
      }).catch(error => {
        console.error(error.message);
      });
      if (mot == 'tag') {
        var i = this.annotations[tagType][index].rejectedBy.map(function (e) {
          return e.withCreator;
        }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.annotations[tagType][index].rejectedBy.splice(i, 1);
        }
        this.annotations[tagType][index].rejectedByMe = false;
      }
      else if (mot == 'geo') {
        var i = this.geoannotations[index].rejectedBy.map(function (e) {
          return e.withCreator;
        }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.geoannotations[index].rejectedBy.splice(i, 1);
        }
        this.geoannotations[index].rejectedByMe = false;
      }
      else if (mot == 'color') {
        var i = this.colorannotations[index].rejectedBy.map(function (e) {
          return e.withCreator;
        }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.colorannotations[index].rejectedBy.splice(i, 1);
        }
        this.colorannotations[index].rejectedByMe = false;
      }
      else if (mot == 'poll') {
        var i = this.pollannotations[index].rejectedBy.map(function (e) {
          return e.withCreator;
        }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.pollannotations[index].rejectedBy.splice(i, 1);
        }
        this.pollannotations[index].rejectedByMe = false;
      }
      else if (mot == 'comment') {
        var i = this.commentAnnotations[index].rejectedBy.map(function (e) {
          return e.withCreator;
        }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.commentAnnotations[index].rejectedBy.splice(i, 1);
        }
        this.commentAnnotations[index].rejectedByMe = false;
      }

      if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
        await this.userServices.reloadCurrentUser();
        this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
      } else {
        this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
      }
    }
    if (!this.hasContributed('all')) {
      this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records')
        .catch((error) => {
          console.error("This ERROR occured : ", error);
        });
    }
  }

  async getRecordAnnotations(id) {
    if (this.widgetMotivation == 'Polling') {
      await this.recordServices.getAnnotations(this.recId, 'Polling', this.generatorParam).then(response => {
        for (var i = 0; i < response.length; i++) {
          //if (response[i].annotators[0].generator == (settings.project+' '+(this.campaign.username))) {
          if (!this.userServices.current) {
            this.pollannotations.push(new Annotation(response[i], ""));
          } else {
            this.pollannotations.push(new Annotation(response[i], this.userServices.current.dbId));
          }
          //}
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
        }
        else {
          toastr.info(this.i18n.tr('item:toastr-empty'));
        }
      });
    }
    if (this.widgetMotivation == 'GeoTagging') {
      await this.recordServices.getAnnotations(this.recId, 'GeoTagging', this.generatorParam).then(response => {
        this.geoannotations = [];
        for (var i = 0; i < response.length; i++) {
          if (!this.userServices.current) {
            this.geoannotations.push(new Annotation(response[i], "", this.loc));
          } else {
            this.geoannotations.push(new Annotation(response[i], this.userServices.current.dbId, this.loc));
          }
        }
      });
      // Sort the annotations in descending order, based on their score
      this.geoannotations.sort(function (a, b) {
        return b.score - a.score;
      });
    }
    if (this.widgetMotivation == 'Tagging') {
      await this.recordServices.getAnnotations(this.recId, 'Tagging', this.generatorParam).then(response => {
        this.tagTypes.forEach(type => {
          this.annotations[type] = [];
        });
        for (var i = 0; i < response.length; i++) {
          if (!this.userServices.current) {
            let newAnn = new Annotation(response[i], "", this.loc);
            this.annotations[newAnn.tagType].push(newAnn);
          } else {
            let newAnn = new Annotation(response[i], this.userServices.current.dbId, this.loc);
            this.annotations[newAnn.tagType].push(newAnn);
          }
        }
      });
      // Sort the annotations in descending order, based on their score
      this.tagTypes.forEach(type => {
        this.annotations[type].sort(function (a, b) {
          return b.score - a.score;
        });
      });
    }
    if (this.widgetMotivation == 'ColorTagging') {
      await this.recordServices.getAnnotations(this.recId, 'ColorTagging', this.generatorParam).then(response => {
        this.colorannotations = [];
        for (var i = 0; i < response.length; i++) {
          // Filter the annotations based on the generator
          var flag = false;
          for (var annotator of response[i].annotators) {
            if ((annotator.generator == (settings.project + ' ' + (this.campaign.username)))
              || (annotator.generator == 'Image Analysis')) {
              flag = true;
              break;
            }
          }
          // If the criterias are met, push the annotation inside the array
          if (flag) {
            if (response[i].body.label.en && response[i].body.label.en == "gray") {
              response[i].body.label.en = ["grey"];
              response[i].body.label.default = ["grey"];
            }
            let userId = this.userServices.current ? this.userServices.current.dbId : "";
            let newAnn = new Annotation(response[i], userId, this.loc);
            newAnn.cgCreators = `<li>${newAnn.createdBy[0].externalCreatorName}</li>`;
            let existingAnn = this.colorannotations.find(ann => ann.uri == newAnn.uri);
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
    }
    if (this.widgetMotivation == 'Commenting') {
      await this.recordServices.getAnnotations(this.recId, 'Commenting', this.generatorParam).then(response => {
        this.commentAnnotations = [];
        for (var i = 0; i < response.length; i++) {
          if (!this.userServices.current) {
            this.commentAnnotations.push(new Annotation(response[i], "", this.loc));
          } else {
            this.commentAnnotations.push(new Annotation(response[i], this.userServices.current.dbId, this.loc));
          }
        }
      });
      // Sort the annotations in descending order, based on their score
      this.commentAnnotations.sort(function (a, b) {
        return b.score - a.score;
      });
    }
  }

  getColorLabel(labelObject) {
    let label = labelObject[this.loc] || labelObject['en'];
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  getStyle(annotation) {
    let color = this.colorPalette.find(color => color.uri == annotation.uri || color.uri == annotation.uri.replace("http", "https"));
    if (color) {
      return color.style || `background: ${color['cssHexCode']};`;
    }
    return '';
  }

  annotationExists(label) {
    for (var i in this.colorannotations) {
      if (this.colorannotations[i].label == label) {
        return { 'id': this.colorannotations[i].dbId, 'index': i };
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

    for (var i in this.annotations) {
      if (this.annotations[i].createdByMe || this.annotations[i].approvedByMe || this.annotations[i].rejectedByMe) {
        tagFlag = true;
        break;
      }
    }
    for (var i in this.geoannotations) {
      if (this.geoannotations[i].createdByMe || this.geoannotations[i].approvedByMe || this.geoannotations[i].rejectedByMe) {
        geoFlag = true;
        break;
      }
    }
    for (var i in this.colorannotations) {
      if (this.colorannotations[i].createdByMe || this.colorannotations[i].approvedByMe || this.colorannotations[i].rejectedByMe) {
        colorFlag = true;
        break;
      }
    }
    for (var i in this.pollannotations) {
      if (this.pollannotations[i].createdByMe || this.pollannotations[i].approvedByMe || this.pollannotations[i].rejectedByMe) {
        pollFlag = true;
        break;
      }
    }
    for (var i in this.commentAnnotations) {
      if (this.commentAnnotations[i].createdByMe || this.commentAnnotations[i].approvedByMe || this.commentAnnotations[i].rejectedByMe) {
        commFlag = true;
        break;
      }
    }

    if (mot == "tag") {
      return tagFlag;
    }
    else if (mot == "geo") {
      return geoFlag;
    }
    else if (mot == "color") {
      return colorFlag;
    }
    else if (mot == "poll") {
      return pollFlag;
    }
    else if (mot == "comment") {
      return commFlag;
    }
    else {
      return tagFlag || geoFlag || colorFlag || pollFlag || commFlag;
    }
  }

  hasMotivation(name) {
    return !!this.campaign.motivation.includes(name);
  }

  isCreatedBy(ann) {
    return (ann.createdBy[0].withCreator == this.userId);
  }

  isValidatedBy(ann, valType) {
    if (valType == 'approved') {
      for (let anno of ann.approvedBy) {
        if (anno.withCreator == this.userId) {
          return true;
        }
      }
    }
    else if (valType == 'rejected') {
      for (let anno of ann.rejectedBy) {
        if (anno.withCreator == this.userId) {
          return true;
        }
      }
    }
    else if (valType == 'all') {
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
    this.tagPrefix[tagType] = '';
    this.suggestionsActive[tagType] = false;
    this.prefixChanged(false, tagType);
  }

  isCurrentUserCreator() {
    if (this.userServices.current)
      return this.campaign.creators.includes(this.userServices.current.dbId);
    else
      return false;
  }

  userHasAccessInCampaign() {
    if (!this.userServices.isAuthenticated()) {
      return false;
    }
    if (!this.campaign.userGroupIds || this.campaign.userGroupIds.length === 0) {
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
    let area = document.getElementById('user-tag-textarea');
    area.style.cssText = 'height:' + area.scrollHeight + 'px';
  }

  submitComment() {
    // If the campaign is inactive do NOT annotate
    if (this.campaign.status != 'active') {
      toastr.error(this.i18n.tr('item:toastr-inactive'));
      return;
    }
    if (!this.userHasAccessInCampaign()) {
      toastr.error(this.i18n.tr('item:toastr-restricted'));
      return;
    }

    var comment = this.userComment.trim();
    if (comment.length == 0) {
      toastr.error("Your comment can not be empty");
    }
    else {
      this.annotationServices.annotateRecord(this.recId, null, comment, this.campaign.username, 'Commenting', this.loc).then(() => {
        toastr.success('Annotation added.');
        this.ea.publish('annotations-created', self.record);
        this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'created');
        // After annotating, automatically upvote the new annotation
        this.getRecordAnnotations('').then(() => {
          for (var [i, ann] of this.commentAnnotations.entries()) {
            if (ann.label.toLowerCase() === comment.toLowerCase()) {
              this.score(ann.dbId, 'approved', i, 'comment');
              break;
            }
          }
        });
      }).catch((error) => {
        console.error(error);
        toastr.error(this.i18n.tr('item:toastr-error'));
      });
    }

    this.userComment = '';
    let area = document.getElementById('user-tag-textarea');
    area.style.cssText = 'height: 28px';
  }

}
