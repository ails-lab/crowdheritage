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
import settings from '../../conf/global.config.js';

let COUNT = 5;

@inject(CampaignServices, UserServices)
export class Leaderboard {

  constructor(campaignServices, userServices) {
    this.campaignServices = campaignServices;
    this.userServices = userServices;

    this.points = [];
    this.topUsers = [];
    this.offset = 0;
    this.loading = false;
    this.more = true;
  }

  activate(params) {
    this.campaign = params.campaign;

    // Convert user points object into an array formatted like:
    // [[userId1,totalScore1], [userId2,totalScore2], ...]
    // and sort it in descending order based on user's total points
    if (this.campaign.userPoints) {
      Object.keys(this.campaign.userPoints).forEach( userId => {
        let score = this.campaign.userPoints[userId].created +
                    this.campaign.userPoints[userId].approved +
                    this.campaign.userPoints[userId].rejected;
        this.points.push([userId, score]);
      });
      this.points.sort( function(a, b) {
        return b[1] - a[1];
      });

      this.getTopUsers();
    }
  }

  async getTopUsers() {
    let lim = 0;
    if (this.offset+COUNT > this.campaign.contributorsCount) {
      lim = this.campaign.contributorsCount;
    }
    else {
      lim = this.offset + COUNT;
    }

    for (var i=this.offset; i<lim; i++) {
      await this.getUserData(this.points[i][0], this.points[i][1]);
    }

    this.offset = this.offset + COUNT;
    if (this.offset >= this.campaign.contributorsCount) {
      this.more = false;
    }
  }

  async getUserData(userId, points) {
    let data = await this.userServices.getUser(userId);
    let user = new User(data);
    this.topUsers.push([user, points]);
  }

  loadMore() {
    this.loading = true;
    this.getTopUsers();
    this.loading = false;
  }

  getProfileImage(user) {
    if (user.avatar.Thumbnail) {
			return `${settings.baseUrl}${user.avatar.Thumbnail}`;
		}
		return '/img/assets/images/user.png';
	}

  getName(user) {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    else {
      return `${user.username}`;
    }
  }

}
