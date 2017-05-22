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
import { Annotation } from '../../modules/Annotation';
import { UserServices } from '../../modules/UserServices';
import { RecordServices } from '../../modules/RecordServices';
import { CampaignServices } from '../../modules/CampaignServices.js';
import { AnnotationServices } from '../../modules/AnnotationServices.js';
import { ThesaurusServices } from '../../modules/ThesaurusServices.js';

@inject(UserServices, RecordServices, CampaignServices, AnnotationServices, ThesaurusServices)
export class Tagcolor {

  constructor(userServices, recordServices, campaignServices, annotationServices, thesaurusServices) {
    this.colorSet = [
      ["/img/color/img-black.png", "Black"],
      ["/img/color/img-gray.png", "Grey"],
      ["/img/color/img-metallic.png", "Metallic"],
      ["/img/color/img-silver.png", "Silver"],
      ["/img/color/img-bronze.png", "Bronze"],
      ["/img/color/img-brown.png", "Brown"],
      ["/img/color/img-copper.png", "Copper"],
      ["/img/color/img-red.png", "Red"],
      ["/img/color/img-orange.png", "Orange"],
      ["/img/color/img-beige.png", "Beige"],
      ["/img/color/img-gold.png", "Gold"],
      ["/img/color/img-yellow.png", "Yellow"],
      ["/img/color/img-green.png", "Green"],
      ["/img/color/img-blue.png", "Blue"],
      ["/img/color/img-purple.png", "Purple"],
      ["/img/color/img-pink.png", "Pink"],
      ["/img/color/img-multicolored.png", "Multicoloured", "big"],
      ["/img/color/img-white.png", "White"],
      ["/img/color/img-transparant.png", "Transparent"]
    ];
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

      await this.annotationServices.annotateRecord(this.recId, this.suggestedAnnotation);

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
      this.annotationServices.approve(annoId);
      $(`#up_${annoId}`).addClass("active");
      this.annotations[index].approvedBy.push(this.userServices.current.dbId);
      this.annotations[index].approvedByMe = true;
      if (this.annotations[index].rejectedByMe) {
        $(`#down_${annoId}`).removeClass("active");
        let i = this.annotations[index].rejectedBy.indexOf(this.userServices.current.dbId);
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
      this.annotationServices.reject(annoId);
      $(`#down_${annoId}`).addClass("active");
      this.annotations[index].rejectedBy.push(this.userServices.current.dbId);
      this.annotations[index].rejectedByMe = true;
      if (this.annotations[index].approvedByMe) {
        $(`#up_${annoId}`).removeClass("active");
        let i = this.annotations[index].approvedBy.indexOf(this.userServices.current.dbId);
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
      this.annotationServices.unscore(annoId);
      $(`#up_${annoId}`).removeClass("active");
      let i = this.annotations[index].approvedBy.indexOf(this.userServices.current.dbId);
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
      this.annotationServices.unscore(annoId);
      $(`#down_${annoId}`).removeClass("active");
      let i = this.annotations[index].rejectedBy.indexOf(this.userServices.current.dbId);
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
    // CHANGE "Tagging" to "ColorTagging"
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

  getColor(label) {
    var index = this.colorSet.findIndex( element => {
      return element[1] == label;
    });

    if (index == -1) {
      return '/img/assets/images/no_image.jpg';
    }
    else {
      return this.colorSet[index][0];
    }
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
