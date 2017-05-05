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
import { User } from '../../modules/User';
import { UserServices } from '../../modules/UserServices';
import { Campaign } from '../../modules/Campaign.js';
import { CampaignServices } from '../../modules/CampaignServices.js';

let COUNT = 5;

@inject(CampaignServices, UserServices)
export class Leaderboard {

  constructor(campaignServices, userServices) {
    this.campaignServices = campaignServices;
    this.userServices = userServices;

    this.points = new Map();
  }

  activate(params) {
    this.campaign = params.campaign;

    // Convert user points json into a map
    // with keys the user ObjectIds
    // and values their total points
    if (this.campaign.userPoints) {
      Object.keys(this.campaign.userPoints).forEach( key => {
        let score = this.campaign.userPoints[key].created +
                    this.campaign.userPoints[key].approved +
                    this.campaign.userPoints[key].rejected;
        this.points.set(key, score);
      });
    }
    console.log(this.points.entries());

    //this.getTopUsers(COUNT);
  }

  getTopUsers(count) {

  }

}
