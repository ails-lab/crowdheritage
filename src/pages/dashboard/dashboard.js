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

import { inject, LogManager, NewInstance } from 'aurelia-framework';
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { UserServices } from 'UserServices';
import { MediaServices } from 'MediaServices.js';
import { CampaignServices } from 'CampaignServices.js';
import { Router } from 'aurelia-router';
import { I18N } from 'aurelia-i18n';

let logger = LogManager.getLogger('Dashboard.js');

@inject(UserServices, MediaServices, CampaignServices, Router, I18N, 'loginPopup', NewInstance.of(ValidationController))
export class Dashboard {

  constructor() {
    this.view = "campaign-editor"
    this.campaignClasses = "nav-item active"
    this.collectionClasses = "nav-item"
    this.userGroupClasses = "nav-item"
  }

  tabChanged(tab){
    this.view = tab;
    if(tab === 'collection-editor'){
      this.collectionClasses = "nav-item active"
      this.campaignClasses = "nav-item"
      this.userGroupClasses = "nav-item"
    }
    else if(tab === 'campaign-editor'){
      this.campaignClasses = "nav-item active"
      this.collectionClasses = "nav-item"
      this.userGroupClasses = "nav-item"
    }
    else if(tab === 'user-group-editor'){
      this.campaignClasses = "nav-item"
      this.collectionClasses = "nav-item"
      this.userGroupClasses = "nav-item active"
    }
  }

}
