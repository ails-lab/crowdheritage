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
import { UserServices } from '../../modules/UserServices';
import { RecordServices } from '../../modules/RecordServices';

@inject(UserServices, RecordServices)
export class Tagcolor {

  constructor(userServices, recordServices) {
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

    this.annotations = [];
  }

  activate(params) {
    this.campaign = params.campaign;
    this.userId = params.userId;
    this.recId = params.recId;

    /*
    // CHANGE MOTIVATION TO ColorTagging
    this.recordServices.getAnnotations(this.recId, "Tagging")
      .then( response => {

    });
    console.log(this.annotations);
    */
  }

}
