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

@inject(UserServices, RecordServices, CampaignServices, AnnotationServices, ThesaurusServices)
export class Tagitem {

  constructor(userServices, recordServices, campaignServices, annotationServices, thesaurusServices) {
    this.userServices = userServices;
    this.recordServices = recordServices;
    this.campaignServices = campaignServices;
    this.annotationServices = annotationServices;
    this.thesaurusServices = thesaurusServices;

    this.annotations = [];
    this.suggestedAnnotation = {};
  }

  async activate(params) {
    this.campaign = params.campaign;
    this.recId = params.recId;

    this.annotations.splice(0, this.annotations.length);

    if (this.userServices.isAuthenticated() && this.userServices.current === null) {
      await this.userServices.reloadCurrentUser();
      await this.getRecordAnnotations(this.recId);
    }
    else {
      await this.getRecordAnnotations(this.recId);
    }
  }

  async annotate(label) {
    if (!this.hasContributed()) {
      this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records');
    }

    var answer = this.annotationExists(label);

    if (!answer) {
      if (this.userServices.isAuthenticated() && this.userServices.current === null) {
        await this.userServices.reloadCurrentUser();
      }

      await this.thesaurusServices.getSuggestions(label, ["fashion"])
        .then( res => {
          this.suggestedAnnotation = res.results[0];
        });

      await this.annotationServices.annotateRecord(this.recId, this.suggestedAnnotation, this.campaign.username);

      this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'created');

      // Clear and reload the annotations array
      this.annotations.splice(0, this.annotations.length);
      await this.getRecordAnnotations(this.recId);
    }
    else if (!this.annotations[answer.index].approvedByMe) {
      this.score(answer.id, 'approved', answer.index);
    }
  }

  deleteAnnotation(id, index) {
    this.annotationServices.delete(id)
      .then( () => {
        this.annotations.splice(index, 1);
        this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'created');
        if (!this.hasContributed()) {
          this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records');
        }
      })
      .catch(error => {
				console.log(error.message);
			});
  }

  async score(annoId, annoType, index) {
    if (!this.hasContributed()) {
      this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records');
    }

    if (annoType == 'approved') {
      //this.annotationServices.approve(annoId);
      this.annotationServices.approveObj(annoId, this.campaign.username)
        .then(response => {
          response['withCreator'] = this.userServices.current.dbId;
          this.annotations[index].approvedBy.push(response);
        })
        .catch(error => {
          console.log(error.message);
        });
      $(`#up_${annoId}`).addClass("active");
      this.annotations[index].approvedByMe = true;
      if (this.annotations[index].rejectedByMe) {
        $(`#down_${annoId}`).removeClass("active");
        var i = this.annotations[index].rejectedBy.map(function(e) { return e.withCreator; }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.annotations[index].rejectedBy.splice(i, 1);
        }
        this.annotations[index].rejectedByMe = false;
      }
      else {
        if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
          await this.userServices.reloadCurrentUser();
          this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
        }
        else {
          this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
        }
      }
    }

    if (annoType == 'rejected') {
      //this.annotationServices.reject(annoId);
      this.annotationServices.rejectObj(annoId, this.campaign.username)
        .then(response => {
          response['withCreator'] = this.userServices.current.dbId;
          this.annotations[index].rejectedBy.push(response);
        })
        .catch(error => {
          console.log(error.message);
        });
      $(`#down_${annoId}`).addClass("active");
      this.annotations[index].rejectedByMe = true;
      if (this.annotations[index].approvedByMe) {
        $(`#up_${annoId}`).removeClass("active");
        var i = this.annotations[index].approvedBy.map(function(e) { return e.withCreator; }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.annotations[index].approvedBy.splice(i, 1);
        }
        this.annotations[index].approvedByMe = false;
      }
      else {
        if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
          await this.userServices.reloadCurrentUser();
          this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
        }
        else {
          this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
        }
      }
    }
  }

  async unscore(annoId, annoType, index) {
    if (annoType == 'approved') {
      //this.annotationServices.unscore(annoId);
      this.annotationServices.unscoreObj(annoId)
        .catch(error => {
          console.log(error.message);
        });
      $(`#up_${annoId}`).removeClass("active");
      var i = this.annotations[index].approvedBy.map(function(e) { return e.withCreator; }).indexOf(this.userServices.current.dbId);
      if (i > -1) {
        this.annotations[index].approvedBy.splice(i, 1);
      }
      this.annotations[index].approvedByMe = false;
      if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
        await this.userServices.reloadCurrentUser();
        this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
      }
      else {
        this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
      }
    }

    if (annoType == 'rejected') {
      //this.annotationServices.unscore(annoId);
      this.annotationServices.unscoreObj(annoId)
        .catch(error => {
          console.log(error.message);
        });
      $(`#down_${annoId}`).removeClass("active");
      var i = this.annotations[index].rejectedBy.map(function(e) { return e.withCreator; }).indexOf(this.userServices.current.dbId);
      if (i > -1) {
        this.annotations[index].rejectedBy.splice(i, 1);
      }
      this.annotations[index].rejectedByMe = false;
      if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
        await this.userServices.reloadCurrentUser();
        this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
      }
      else {
        this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
      }
    }

    if (!this.hasContributed()) {
      this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records');
    }
  }

  async getRecordAnnotations(id) {
    await this.recordServices.getAnnotations(this.recId, "Tagging")
      .then( response => {
        for (var i=0; i<response.length; i++) {
          if (!this.userServices.current) {
            this.annotations.push(new Annotation(response[i], ""));
          }
          else {
            this.annotations.push(new Annotation(response[i], this.userServices.current.dbId));
          }
        }
    });

    // Sort the annotations in descending
    // order based on their score
    this.annotations.sort( function(a, b) {
      return b.score - a.score;
    });
  }

  annotationExists(label) {
    for (var i in this.annotations) {
      if (this.annotations[i].label == label) {
        return {'id': this.annotations[i].dbId, 'index': i};
      }
    }
    return null;
  }

  hasContributed() {
    for (var i in this.annotations) {
      if (this.annotations[i].createdByMe || this.annotations[i].approvedByMe || this.annotations[i].rejectedByMe) {
        return true;
      }
    }
    return false;
  }

}
