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
import { User } from 'User';
import { UserServices } from 'UserServices';
import { Campaign } from 'Campaign.js';
import { CampaignServices } from 'CampaignServices.js';
import settings from 'global.config.js';
import { toggleMore } from 'utils/Plugin.js';

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
    this.points = params.points;

    if (this.campaign.userPoints) {
      this.getTopUsers();
    }
  }

	attached() {
		toggleMore(".leaderlist");
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
