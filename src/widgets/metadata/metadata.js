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

import { Record } from 'Record.js';
import { toggleMore } from 'utils/Plugin.js';

export class Metadata {

  constructor() {
    this.record = null;

    this.place = "";
    this.date = "";
    this.format = "";
    this.formatUri = "";
    this.medium = "";
    this.mediumUri = "";
	  this.rightsImage = null;
  }

  attached() {
    // toggleMore(".meta");
  }

  async activate(params) {
    this.record = params.record;
    try {
      if (this.record.data) {
        if ('content' in this.record.data) {
          let content = JSON.parse(this.record.data.content['JSONLD-EDM'])['@graph'];
          for (let i in content) {
            if ( (content[i]['@type'] == "edm:Place") && (content[i]['skos:altLabel']) && this.isString(content[i]['skos:altLabel']) ) {
              this.place = content[i]['skos:altLabel'];
            }
            if ( (content[i]['@type'] == "ore:Proxy") && (content[i]['edm:year']) ) {
              this.date = content[i]['edm:year'];
            }
            if ( (content[i]['@type'] == "ore:Proxy") && (content[i]['dc:format']) ) {
              this.formatUri = content[i]['dc:format'][0] ? content[i]['dc:format'][0]['@id'] : '';
              this.format = content[i]['dc:format'][1] && content[i]['dc:format'][1]['@value'] ? content[i]['dc:format'][1]['@value'].split(' ')[1] : '';
            }
            if ( (content[i]['@type'] == "ore:Proxy") && (content[i]['dcterms:medium']) ) {
              this.mediumUri = content[i]['dcterms:medium'][1] ? content[i]['dcterms:medium'][1]['@id'] : '';
              this.medium = content[i]['dcterms:medium'][0] && content[i]['dcterms:medium'][0]['@value'] ? content[i]['dcterms:medium'][0]['@value'].split(' ')[1] : '';
            }
          }
        }
      }
    }
    catch (err) {
      console.log(err);
    }
      if (typeof this.record.rights !== 'undefined' && this.record.rights.includes("rightsstatements.org")) {
        let s = this.record.rights.split("/");
        this.record.rightsImage = "https://rightsstatements.org/files/buttons/"+s[s.length - 3]+".white.svg";
      }
  }

  toggleLoadMore(container) {
    toggleMore(container);
  }

  isString(value) {
    return typeof value === 'string' || value instanceof String;
  }

  parseDescription(desc) {
    let descList = desc.replace(/\//g, '<br>').split('<br>');
    var response = [];
    for (let line of descList) {
      let temp = line.split('(');
      if (temp.length>1) {
        let item = {};
        item["actor"] = temp[0].trim();
        item["role"] = '('+temp[1];
        response.push(item);
      }
      else {
        response.push(temp[0]);
      }
    }
    return response;
  }
}
