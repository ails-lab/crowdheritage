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


export class Annotation {

  constructor(data, userId) {
    this.dbId = data.dbId;
    this.label = data.body.label.default[0];

    this.createdByMe = false;
    for (let anno in data.annotators) {
      if (anno.withCreator == userId) {
        var createdByMe = true;
        break;
      }
    }

    this.approvedBy = [];
    this.approvedByMe = false;
    this.rejectedBy = [];
    this.rejectedByMe = false;
    if (data.score) {
      if (data.score.approvedBy) {
        this.approvedBy = data.score.approvedBy;
        this.approvedByMe = this.approvedBy.includes(userId);
      }
      if (data.score.rejectedBy) {
        this.rejectedBy = data.score.rejectedBy;
        if (!this.approvedByMe) {
          this.rejectedByMe = this.rejectedBy.includes(userId);;
        }
      }
    }

  }

}
