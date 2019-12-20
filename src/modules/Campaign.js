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


import settings from 'global.config.js';

export class Campaign {

  constructor(data) {
    this.dbId = data.dbId;
    this.username = data.username;
    this.title = data.title;
    this.description = data.description;
    this.banner = data.banner;
    if (this.banner) {
      if (!this.banner.startsWith('http')) {
        this.banner=`${settings.baseUrl}${this.banner}`;}
      }
    this.logo = data.logo;
    this.project = data.project;
    this.creators = data.creators;
    this.space = data.space;
    this.spacename = data.spacename;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.motivation = data.motivation;
    this.purpose = data.purpose;
    this.target = data.annotationTarget;
    this.created = data.annotationCurrent.created;
    this.approved = data.annotationCurrent.approved;
    this.rejected = data.annotationCurrent.rejected;
    this.contributorsCount = Object.keys(data.contributorsPoints).length;
    this.totalCurrent = this.created + this.approved + this.rejected;
    this.percentage = Math.min(100, Math.floor(100 * this.totalCurrent / this.target));
    this.userPoints = data.contributorsPoints;
    this.targetCollections = data.targetCollections;
    this.badges = data.badges;
		this.prizes = data.prizes;
		this.instructions = data.instructions;
    this.vocabularies = data.vocabularies;

    var today = new Date();
    var start = new Date(this.startDate);
    var end = new Date(this.endDate);
    this.status = 'void';
    if ( (today>start) && (today<end) ) {
      this.status = 'active';
    }
    else if ( (today>start) && (today>end) ) {
      this.status = 'inactive';
    }
    else if ( (today<start) && (today<end) ) {
      this.status = 'upcoming';
    }
  }

}
