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

  constructor(data, userId, lang="all", generator) {
    this.dbId = data.dbId;

    if (data.body.label) {
      this.label = this.capitalizeFirstLetter(data.body.label.default[0]);
      try {
        this.labelLang = Object.keys(data.body.label).filter(key => key != "default")[0].toUpperCase();
      } catch (e) {
        this.labelLang = "DEFAULT";
      }

      if (lang !== "all") {
        if (lang === 'en' && typeof data.body.label.en !== 'undefined') {
          this.label = this.capitalizeFirstLetter(data.body.label.en[0]);
          this.labelLang = 'EN';
        }
        else if (lang === 'fr' && typeof data.body.label.fr !== 'undefined') {
          this.label = this.capitalizeFirstLetter(data.body.label.fr[0]);
          this.labelLang = 'FR';
        }
        else if (lang === 'it' && typeof data.body.label.it !== 'undefined') {
          this.label = this.capitalizeFirstLetter(data.body.label.it[0]);
          this.labelLang = 'IT';
        }
        else if (lang === 'es' && typeof data.body.label.es !== 'undefined') {
          this.label = this.capitalizeFirstLetter(data.body.label.es[0]);
          this.labelLang = 'ES';
        }
        else if (lang === 'pl' && typeof data.body.label.pl !== 'undefined') {
          this.label = this.capitalizeFirstLetter(data.body.label.pl[0]);
          this.labelLang = 'PL';
        }
        else if (lang === 'el' && typeof data.body.label.el !== 'undefined') {
          this.label = this.capitalizeFirstLetter(data.body.label.el[0]);
          this.labelLang = 'EL';
        }
      }
    }
    else {
      this.label = data.annotators[0].externalCreatorName || "Image tag";
    }

    this.createdBy = data.annotators;
    this.createdByMe = false;
    for (let i in data.annotators) {
      if (data.annotators[i].withCreator == userId) {
        this.createdByMe = true;
        break;
      }
    }
    if(data.motivation){
    	this.motivation=data.motivation;
    }else{this.motivation="";}
    if(this.motivation=="GeoTagging" && data.body){
    	this.countryName=data.body.countryName;
    	this.coordinates=data.body.coordinates;
    }
    this.uri=data.body.uri;
    this.selector = data.target.selector;
    this.tagType = data.target.selector ? data.target.selector.property : "";
    this.approvedBy = [];
    this.approvedByMe = false;
    this.rejectedBy = [];
    this.rejectedByMe = false;
    this.rejectedByMeReasons = [];
    this.ratedBy = [];
    this.ratedByMe = false;
    this.ratedByMeValue = -1;
    this.score = 0;
    if (data.score) {
      if (data.score.approvedBy) {
        this.approvedBy = data.score.approvedBy;
        for (let i in this.approvedBy) {
          if (this.approvedBy[i].withCreator == userId) {
            this.approvedByMe = true;
            break;
          }
        }
        this.score = this.score + data.score.approvedBy.length;
      }
      if (data.score.rejectedBy) {
        this.rejectedBy = data.score.rejectedBy;
        if (!this.approvedByMe) {
          for (let i in this.rejectedBy) {
            if (this.rejectedBy[i].withCreator == userId) {
              this.rejectedByMe = true;
              if (this.motivation === 'SubTagging' && this.rejectedBy[i].validationErrorType) {
                this.rejectedByMeReasons = this.rejectedBy[i].validationErrorType;
              }
              break;
            }
          }
        }
        this.score = this.score - data.score.rejectedBy.length;
      }
      if (data.score.ratedBy) {
        this.ratedBy = data.score.ratedBy.filter(rate => rate.generator === generator);
        if (!this.ratedByMe) {
          for (let i in this.ratedBy) {
            if (this.ratedBy[i].withCreator == userId) {
              this.ratedByMe = true;
              this.ratedByMeValue = this.ratedBy[i].confidence;
              break;
            }
          }
        }
        this.score = data.score.ratedBy.length;
      }
    }
		this.publish = data.publish;
  }

  capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

}
