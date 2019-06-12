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


import { inject } from 'aurelia-framework';
import { Router, activationStrategy } from 'aurelia-router';
import { Record } from 'Record.js';
import { UserServices } from 'UserServices';
import { RecordServices } from 'RecordServices.js';
import { toggleMore } from 'utils/Plugin.js';

@inject(Router, UserServices, RecordServices)
export class Metadata {

  constructor(router, userServices, recordServices) {
    this.router = router;
    this.userServices = userServices;
    this.recordServices = recordServices;

    this.record = null;

    this.place = "";
    this.date = "";
    this.format = "";
    this.formatUri = "";
    this.medium = "";
    this.mediumUri = "";
  }

  async activate(params) {
    this.record = params.record;

    if (this.record.data) {
      console.log(this.record);

      if ( !('content' in this.record.data) ) {
        await this.recordServices.getRecord(this.record.dbId)
          .then( response => {
            //this.record = response;
            let content = JSON.parse(response.content['JSONLD-EDM'])['@graph'];
            for (let i in content) {
              if ( (content[i]['@type'] == "edm:Place") && (content[i]['skos:altLabel']) && this.isString(content[i]['skos:altLabel']) ) {
                this.place = content[i]['skos:altLabel'];
              }
              if ( (content[i]['@type'] == "ore:Proxy") && (content[i]['edm:year']) ) {
                this.date = content[i]['edm:year'];
              }
              if ( (content[i]['@type'] == "ore:Proxy") && (content[i]['dc:format']) ) {
                this.formatUri = content[i]['dc:format'][0]['@id'];
                this.format = content[i]['dc:format'][1]['@value'].split(' ')[1];
              }
              if ( (content[i]['@type'] == "ore:Proxy") && (content[i]['dcterms:medium']) ) {
                this.mediumUri = content[i]['dcterms:medium'][1]['@id'];
                this.medium = content[i]['dcterms:medium'][0]['@value'].split(' ')[1];
              }
            }
          })
          .catch(error => {
            console.log(error.message);
          });
      }

      else {
        let content = JSON.parse(this.record.data.content['JSONLD-EDM'])['@graph'];
        console.log(this.record.data.content['JSONLD-EDM']);
        for (let i in content) {
          if ( (content[i]['@type'] == "edm:Place") && (content[i]['skos:altLabel']) && this.isString(content[i]['skos:altLabel']) ) {
            this.place = content[i]['skos:altLabel'];
          }
          if ( (content[i]['@type'] == "ore:Proxy") && (content[i]['edm:year']) ) {
            this.date = content[i]['edm:year'];
          }
          if ( (content[i]['@type'] == "ore:Proxy") && (content[i]['dc:format']) ) {
            this.formatUri = content[i]['dc:format'][0]['@id'];
            this.format = content[i]['dc:format'][1]['@value'].split(' ')[1];
          }
          if ( (content[i]['@type'] == "ore:Proxy") && (content[i]['dcterms:medium']) ) {
            this.mediumUri = content[i]['dcterms:medium'][1]['@id'];
            this.medium = content[i]['dcterms:medium'][0]['@value'].split(' ')[1];
          }
        }
      }

    }
  }

  toggleLoadMore(container) {
    toggleMore(container);
  }

  isString(value) {
    return typeof value === 'string' || value instanceof String;
  }
}
