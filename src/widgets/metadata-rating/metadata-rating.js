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
    this.rating = 0;
    this.ratingText = '';
    this.selectedErrorTypes = [];
    this.errorTypes = ['Error 1', 'Error 2', 'Error 3'];
    this.corrected_translation = '';
    this.comment = '';
	}
  activate(params) {
    this.index = params.index;
  }
  ratingChanged(){
    this.ratingText = this.rating
  }
  ratingTextChanged(){
    this.rating = this.ratingText
    if (this.ratingText == ""){
      this.rating = 0;
    }
  }
  removeSelectedError(err){
    const index = this.selectedErrorTypes.indexOf(err);
    if (index > -1) {
      this.selectedErrorTypes.splice(index, 1);
    }
  }
  addErrorType(err) {
    if (!this.selectedErrorTypes.includes(err)) {
      this.selectedErrorTypes.push(err);
    }
  }

  // Done in js/jquery because the bootstrap way did not work
  toggleCollapse(){
    if($(`#collapse-${this.index}`).hasClass('in')){
      $(`#collapse-${this.index}`).collapse('hide'); 
    }
    else{
      $(`#collapse-${this.index}`).collapse('show')
    }
  }
  submitRating(){
    // Submit rating
  }
  submitDetails(){
    console.log(this.selectedErrorTypes, this.corrected_translation, this.comment)
    // Submit rating
  }

}
