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

@inject(UserServices, RecordServices, CampaignServices, AnnotationServices)
export class Tagcolor {

  constructor(userServices, recordServices, campaignServices, annotationServices) {
    this.colorSet = [
      ["/img/color/img-black.png", "Black"],
      ["/img/color/img-gray.png", "Gray"],
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
      ["/img/color/img-multicolored.png", "Multicolored", "big"],
      ["/img/color/img-white.png", "White"],
      ["/img/color/img-transparant.png", "Transparent"]
    ];
    this.userServices = userServices;
    this.recordServices = recordServices;
    this.campaignServices = campaignServices;
    this.annotationServices = annotationServices;

    this.annotations = [];
  }

  async activate(params) {
    this.campaign = params.campaign;
    this.userId = params.userId;
    this.recId = params.recId;

    await this.getRecordAnnotations(this.recId);
    console.log(this.annotations);
  }

  async score(annoId, annoType, index) {
    if ((annoType == 'approved') && (this.annotations[index].approvedByMe == false)) {
      this.annotationServices.approve(annoId);
      $(`#up_${annoId}`).addClass("active");
      this.annotations[index].approvedBy.push(this.userServices.current.dbId);
      this.annotations[index].approvedByMe = true;
      if (this.annotations[index].rejectedByMe) {
        $(`#down_${annoId}`).removeClass("active");
        this.annotations[index].rejectedBy.pop(this.userServices.current.dbId);
        this.annotations[index].rejectedByMe = true;
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

    if ((annoType == 'rejected') && (this.annotations[index].rejectedByMe == false)) {
      this.annotationServices.reject(annoId);
      $(`#down_${annoId}`).addClass("active");
      this.annotations[index].rejectedBy.push(this.userServices.current.dbId);
      this.annotations[index].rejectedByMe = true;
      if (this.annotations[index].approvedByMe) {
        $(`#up_${annoId}`).removeClass("active");
        this.annotations[index].approvedBy.pop(this.userServices.current.dbId);
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
    if ((annoType == 'approved') && (this.annotations[index].approvedByMe == true)) {
      this.annotationServices.unscore(annoId);
      $(`#up_${annoId}`).removeClass("active");
      this.annotations[index].approvedBy.pop(this.userServices.current.dbId);
      this.annotations[index].approvedByMe = false;
      if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
        await this.userServices.reloadCurrentUser();
        this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
      }
      else {
        this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
      }
    }

    if ((annoType == 'rejected') && (this.annotations[index].rejectedByMe == true)) {
      this.annotationServices.unscore(annoId);
      $(`#down_${annoId}`).removeClass("active");
      this.annotations[index].rejectedBy.pop(this.userServices.current.dbId);
      this.annotations[index].rejectedByMe = false;
      if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
        await this.userServices.reloadCurrentUser();
        this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
      }
      else {
        this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
      }
    }
  }

  async getRecordAnnotations(id) {
    // CHANGE "Tagging" to "ColorTagging"
    await this.recordServices.getAnnotations(this.recId, "Tagging")
      .then( response => {
        for (var i=0; i<response.length; i++) {
          this.annotations.push(new Annotation(response[i], this.userId));
        }
    });
  }

}