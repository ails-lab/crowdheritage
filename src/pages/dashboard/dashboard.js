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
import { User } from 'User.js';
import { Record } from 'Record.js';
import { Campaign } from 'Campaign.js';
import { I18N } from 'aurelia-i18n';
import settings from 'global.config.js';

let logger = LogManager.getLogger('Dashboard.js');

let COUNT = 10;

@inject(UserServices, MediaServices, CampaignServices, Router, I18N, 'loginPopup', NewInstance.of(ValidationController))
export class Dashboard {
  
  constructor() {
    this.view = "campaign-editor"
    this.collectionClasses = "nav-item"
    this.campaignClasses = "nav-item active"

  }
  
  tabChanged(tab){
    this.view = tab;
    if(tab === 'collection-editor'){
      this.collectionClasses = "nav-item active"
      this.campaignClasses = "nav-item"
    }
    else if(tab === 'campaign-editor'){
      this.campaignClasses = "nav-item active"
      this.collectionClasses = "nav-item"
    }
  }

}