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


import {inject} from 'aurelia-dependency-injection';
import {Annotation} from 'Annotation';
import {UserServices} from 'UserServices';
import {RecordServices} from 'RecordServices';
import {CampaignServices} from 'CampaignServices.js';
import {AnnotationServices} from 'AnnotationServices.js';
import {ThesaurusServices} from 'ThesaurusServices.js';
import {bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import { toggleMore } from 'utils/Plugin.js';
import settings from 'global.config.js';

@inject(UserServices, RecordServices, CampaignServices, EventAggregator, AnnotationServices, ThesaurusServices, 'loginPopup')
export class Tagitem {

  @bindable prefix = '';

  constructor(userServices, recordServices, campaignServices, eventAggregator, annotationServices, thesaurusServices, loginPopup) {
		this.colorSet = [
			["Black", "background-color: #111111", "color: #111111; filter: brightness(500%);"],
			["Grey", "background-color: #AAAAAA","color: #AAAAAA; filter: brightness(60%);"],
			["Brown","background-color: brown", "color:brown; filter: brightness(60%);"],
			["Red", "background-color: #FF4136","color: #FF4136; filter: brightness(60%);"],
			["Orange", "background-color: #FF851B", "color: #FF851B; filter: brightness(60%);"],
			["Beige", "background-color: beige", "color: beige; filter: brightness(60%);"],
			["Yellow", "background-color: #FFDC00", "color: #FFDC00; filter: brightness(60%);"],
			["Green", "background-color: #2ECC40", "color: #2ECC40; filter: brightness(60%);"],
			["Blue", "background-color: #0074D9", "color: #0074D9; filter: brightness(60%);"],
			["Purple", "background-color: #B10DC9", "color: #B10DC9; filter: brightness(60%);"],
			["Pink", "background-color: pink", "color: pink; filter: brightness(60%);"],
			["White", "background-color: #FFFFFF", "color: #FFFFFF; filter: brightness(60%);"],
			["Copper", "background-image: url(/img/color/copper.jpg)", "color: #b87333; filter: brightness(50%);"],
			["Silver", "background-image: url(/img/color/silver.jpg)", "color:  #DDDDDD; filter: brightness(30%);"],
			["Bronze", "background-image: url(/img/color/bronze.jpg)","color: #cd7f32; filter: brightness(50%);" ],
			["Gold", "background-image: url(/img/color/gold.jpg)", "color: #FFD700; filter: brightness(50%);"],
			["Transparent", "", "color: white; text-shadow: 1px 1px 2px #424242;"],
			["Multicolor", "background-image: linear-gradient(to right, red,orange,yellow,green,blue,indigo,violet)", " color: white; text-shadow: 1px 1px 2px #424242;"]
		];
		this.ea = eventAggregator;
    this.userServices = userServices;
    this.recordServices = recordServices;
    this.campaignServices = campaignServices;
    this.annotationServices = annotationServices;
    this.thesaurusServices = thesaurusServices;
    this.placeholderText = "Start typing a term then select from the options";
    this.annotations = [];
    this.geoannotations = [];
    this.colorannotations = [];
    this.pollannotations = [];
    this.suggestedAnnotation = {};
    this.suggestionsLoading = false;
    this.suggestedAnnotations =  [];
		this.selectedAnnotation = null;
		this.lg=loginPopup;
		this.uriRedirect = false;

		this.evsubscr1 = this.ea.subscribe('annotations-created', () => { this.reloadAnnotations()});
		this.handleBodyClick = e => {
      console.log(e.target.id);
      if(e.target.id!="annotationInput"){
      	this.suggestedAnnotations =  [];
      	 this.suggestionsLoading = false;
      }
    };
  }

  attached() {
      document.addEventListener('click', this.handleBodyClick);
			toggleMore(".taglist");
  }

  detached() {
	  this.evsubscr1.dispose();
    document.removeEventListener('click', this.handleBodyClick);
  }

  async activate(params) {
    this.campaign = params.campaign;
    this.recId = params.recId;
    try {
      this.colTitle = params.colTitle[0].split(' (')[0];
    } catch (e) {
      this.colTitle = "";
    }
    this.annotations.splice(0, this.annotations.length);
    this.geoannotations.splice(0, this.geoannotations.length);
    this.colorannotations.splice(0, this.colorannotations.length);
    this.pollannotations.splice(0, this.pollannotations.length);;
    this.pollTitle = "";

    if (this.userServices.isAuthenticated() && this.userServices.current === null) {
      await this.userServices.reloadCurrentUser();
    }
    await this.getRecordAnnotations(this.recId);
    // DELETE THIS AFTER THE TESTING
    // console.log("tags");
    // console.log(this.annotations);
    // console.log("geotags");
    // console.log(this.geoannotations);
    // console.log("colortags");
    // console.log(this.colorannotations);
    // console.log("polltags");
    // console.log(this.pollannotations);
  }

  async reloadAnnotations() {
    this.annotations = [];
    this.geoannotations = [];
    this.colorannotations = [];
    this.pollannotations = [];
    await this.getRecordAnnotations(this.recId);
  }

  prefixChanged(geo=false) {
    //	console.log(this.selectedAnnotation+' '+this.selectedAnnotation.vocabulary+' '+this.selectedAnnotation.label);
    if (this.prefix === '' || this.selectedAnnotation != null) {
      this.suggestedAnnotations = [];
      return;
    }
    this.selectedAnnotation = null;
		if (geo || this.campaign.motivation == 'GeoTagging') {
			this.getGeoAnnotations(this.prefix);
		} else {
			this.getSuggestedAnnotations(this.prefix);
		}
  }

	async getGeoAnnotations(prefix) {
		this.lastRequest = prefix;
		this.suggestionsLoading = true;
		this.suggestedAnnotations = this.suggestedAnnotations.slice(0, this.suggestedAnnotations.length);
		this.selectedAnnotation = null;
		let self = this;
		await this.thesaurusServices.getGeonameSuggestions(prefix)
		.then((res) => {
    	self.getGeoSuggestions( res);
  	});
	}

	getGeoSuggestions(jData) {
		if (jData == null) {
			// There was a problem parsing search results
			alert("nothing found");
			return;
		}
		var html = '';
		var geonames = jData.geonames;
		this.suggestedAnnotations = geonames;
 		/*if (self.suggestedAnnotations.length > 0 && self.suggestedAnnotations[0].exact) {
		self.selectedAnnotation = self.suggestedAnnotations[0];
		}*/
		this.suggestionsLoading = false;
	}

  async getSuggestedAnnotations(prefix) {
    this.lastRequest = prefix;
    this.suggestionsLoading = true;
    this.suggestedAnnotations = this.suggestedAnnotations.slice(0, this.suggestedAnnotations.length);
    this.selectedAnnotation = null;
    let self = this;
    await this.thesaurusServices.getCampaignSuggestions(prefix, this.campaign.dbId).then((res) => {
      if (res.request === self.lastRequest) {
        //this.suggestedAnnotations = res.results.slice(0, 20);
        self.suggestedAnnotations = res.results;
        if (self.suggestedAnnotations.length > 0 && self.suggestedAnnotations[0].exact) {
          self.selectedAnnotation = self.suggestedAnnotations[0];
        }
        self.suggestionsLoading = false;
      }
    });
  }

	selectGeoAnnotation(geoid) {
    // If the campaign is inactive do NOT geoannotate
    if (!this.campaign.active) {
      toastr.error('The campaign is NOT active.');
      return;
    }

	  if(this.userServices.isAuthenticated()==false){
      toastr.error('You must log in before starting contributing.');
      this.lg.call();
			return;
		}

		this.selectedAnnotation = this.suggestedAnnotations.find(obj => {
			return obj.geonameId === geoid
		});
		let existscheck=this.geoannotations.find(obj => {
			console.log(obj);
			return (obj.uri &&  obj.uri.indexOf(geoid)!=-1)
		});
		if(existscheck!=null){
			this.prefix = "";
			this.selectedAnnotation = null;
			this.suggestedAnnotations = [];
			toastr.error('Geotag already exists');
			return;
		}
		this.suggestedAnnotations = [];
		this.errors = this.selectedAnnotation == null;

		if (!this.errors) {
			let self = this;
			this.annotationServices.annotateGeoRecord(this.recId, geoid, this.campaign.username)
			.then(() => {
				toastr.success('Annotation added.');
				self.ea.publish('annotations-created', self.record);
				self.ea.publish('geotag-created', this.selectedAnnotation);
        if (!this.hasContributed()) {
          this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records');
        }
        this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'created');
			 	this.prefix = "";
				this.selectedAnnotation = null;
			}).catch((error) => {
				toastr.error('An error has occured');
			});
		}
 	}

  selectSuggestedAnnotation(index) {
    // If the campaign is inactive do NOT validate
    if (!this.campaign.active) {
      toastr.error('The campaign is NOT active.');
      return;
    }
    if (this.uriRedirect) {
			this.uriRedirect = false;
			this.prefixChanged();
			return;
		}
    if (this.userServices.isAuthenticated() == false) {
      toastr.error('You must log in before starting contributing.');
      this.lg.call();
			return;
		}

    this.selectedAnnotation = this.suggestedAnnotations.find(obj => {
      return obj.id === index
    });
    let lb = this.selectedAnnotation.label;
    let existscheck = this.annotations.find(obj => {
      return obj.label === lb
    });
    if (existscheck != null) {
      this.prefix = "";
      this.selectedAnnotation = null;
      this.suggestedAnnotations = [];
      toastr.error('Tag already exists');
      return;
    }
    this.suggestedAnnotations = [];
    this.errors = this.selectedAnnotation == null;

    if (!this.errors) {
      let self = this;
      this.annotationServices.annotateRecord(this.recId, this.selectedAnnotation, this.campaign.username, 'Tagging').then(() => {
        toastr.success('Annotation added.');
        self.ea.publish('annotations-created', self.record);
        if (!this.hasContributed()) {
          this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records');
        }
        this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'created');
        this.prefix = "";
        this.selectedAnnotation = null;
      }).catch((error) => {
        toastr.error('An error has occured');
      });
    }
  }

  get suggestionsActive() {
    return this.suggestedAnnotations.length !== 0;
  }

  async annotateLabel(label) {
    // If the campaign is inactive do NOT annotate
    if (!this.campaign.active) {
      toastr.error('The campaign is NOT active.');
      return;
    }

    if (this.userServices.isAuthenticated() == false) {
      toastr.error('You must log in before starting contributing.');
      this.lg.call();
      return;
    }
    if (!this.hasContributed()) {
      this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records');
    }
    var answer = this.annotationExists(label);
    if (!answer) {
      if (this.userServices.isAuthenticated() && this.userServices.current === null) {
        await this.userServices.reloadCurrentUser();
      }
      await this.thesaurusServices.getSuggestions(label, this.campaign.vocabularies).then(res => {
        this.suggestedAnnotation = res.results[0];
      });
      await this.annotationServices.annotateRecord(this.recId, this.suggestedAnnotation, this.campaign.username, 'ColorTagging');
      this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'created');
      // Clear and reload the colorannotations array
      this.colorannotations.splice(0, this.colorannotations.length);
      await this.getRecordAnnotations(this.recId);
    } else if (!this.colorannotations[answer.index].approvedByMe) {
      this.score(answer.id, 'approved', answer.index);
    }
  }

  // mot has 3 potential values : [tag, geo, color]
  // depending on which widget called the function
  deleteAnnotation(id, index, mot) {
    if (this.userServices.isAuthenticated() == false) {
      toastr.error('You must log in before starting contributing.');
      this.lg.call();
      return;
    }

    this.annotationServices.delete(id).then(() => {
      if (mot == 'tag') {
        this.annotations.splice(index, 1);
      }
      else if (mot == 'geo') {
        var lt=this.geoannotations[index];
        this.geoannotations.splice(index, 1);
        if (this.campaign.motivation == 'GeoTagging')
  				this.ea.publish('geotag-removed', lt.coordinates);
      }
      else if (mot == 'color') {
        this.colorannotations.splice(index, 1);
      }

      this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'created');
      if (!this.hasContributed()) {
        this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records');
      }
    }).catch(error => {
      console.log(error.message);
    });
  }

  async validate(annoId, annoType, index, approvedByMe, rejectedByMe, mot) {
    // If the campaign is inactive do NOT validate
    if (!this.campaign.active) {
      toastr.error('The campaign is NOT active.');
      return;
    }

    if (this.userServices.isAuthenticated() == false) {
      toastr.error('You must log in before starting contributing.');
      this.lg.call();
      return;
    }

    if (((annoType == 'approved') && approvedByMe) || ((annoType == 'rejected') && rejectedByMe))
      this.unscore(annoId, annoType, index, mot);
    else
      this.score(annoId, annoType, index, mot);
  }

  async score(annoId, annoType, index, mot) {
    if (!this.hasContributed()) {
      this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records');
    }

    if (annoType == 'approved') {
      //this.annotationServices.approve(annoId);
      this.annotationServices.approveObj(annoId, this.campaign.username).then(response => {
        response['withCreator'] = this.userServices.current.dbId;
        if (mot == 'tag') {
          this.annotations[index].approvedBy.push(response);
        }
        else if (mot == 'geo') {
          this.geoannotations[index].approvedBy.push(response);
        }
        else if (mot == 'color') {
          this.colorannotations[index].approvedBy.push(response);
        }
        else if (mot == 'poll') {
          this.pollannotations[index].approvedBy.push(response);
        }
      }).catch(error => {
        console.log(error.message);
      });
      if (mot == 'tag') {
        this.annotations[index].approvedByMe = true;
        if (this.annotations[index].rejectedByMe) {
          var i = this.annotations[index].rejectedBy.map(function(e) {
            return e.withCreator;
          }).indexOf(this.userServices.current.dbId);
          if (i > -1) {
            this.annotations[index].rejectedBy.splice(i, 1);
          }
          this.annotations[index].rejectedByMe = false;
        } else {
          if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
            await this.userServices.reloadCurrentUser();
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          } else {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          }
        }
      }
      else if (mot == 'geo') {
        this.geoannotations[index].approvedByMe = true;
        if (this.geoannotations[index].rejectedByMe) {
          var i = this.geoannotations[index].rejectedBy.map(function(e) {
            return e.withCreator;
          }).indexOf(this.userServices.current.dbId);
          if (i > -1) {
            this.geoannotations[index].rejectedBy.splice(i, 1);
          }
          this.geoannotations[index].rejectedByMe = false;
        } else {
          if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
            await this.userServices.reloadCurrentUser();
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          } else {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          }
        }
      }
      else if (mot == 'color') {
        this.colorannotations[index].approvedByMe = true;
        if (this.colorannotations[index].rejectedByMe) {
          var i = this.colorannotations[index].rejectedBy.map(function(e) {
            return e.withCreator;
          }).indexOf(this.userServices.current.dbId);
          if (i > -1) {
            this.colorannotations[index].rejectedBy.splice(i, 1);
          }
          this.colorannotations[index].rejectedByMe = false;
        } else {
          if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
            await this.userServices.reloadCurrentUser();
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          } else {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          }
        }
      }
      else if (mot == 'poll') {
        this.pollannotations[index].approvedByMe = true;
        if (this.pollannotations[index].rejectedByMe) {
          var i = this.pollannotations[index].rejectedBy.map(function(e) {
            return e.withCreator;
          }).indexOf(this.userServices.current.dbId);
          if (i > -1) {
            this.pollannotations[index].rejectedBy.splice(i, 1);
          }
          this.pollannotations[index].rejectedByMe = false;
        } else {
          if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
            await this.userServices.reloadCurrentUser();
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          } else {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          }
        }
      }
    }

    if (annoType == 'rejected') {
      //this.annotationServices.reject(annoId);
      this.annotationServices.rejectObj(annoId, this.campaign.username).then(response => {
        response['withCreator'] = this.userServices.current.dbId;
        if (mot == 'tag') {
          this.annotations[index].rejectedBy.push(response);
        }
        else if (mot == 'geo') {
          this.geoannotations[index].rejectedBy.push(response);
        }
        else if (mot == 'color') {
          this.colorannotations[index].rejectedBy.push(response);
        }
        else if (mot == 'poll') {
          this.pollannotations[index].rejectedBy.push(response);
        }
      }).catch(error => {
        console.log(error.message);
      });
      if (mot == 'tag') {
        this.annotations[index].rejectedByMe = true;
        if (this.annotations[index].approvedByMe) {
          var i = this.annotations[index].approvedBy.map(function(e) {
            return e.withCreator;
          }).indexOf(this.userServices.current.dbId);
          if (i > -1) {
            this.annotations[index].approvedBy.splice(i, 1);
          }
          this.annotations[index].approvedByMe = false;
        } else {
          if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
            await this.userServices.reloadCurrentUser();
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          } else {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          }
        }
      }
      else if (mot == 'geo') {
        this.geoannotations[index].rejectedByMe = true;
        if (this.geoannotations[index].approvedByMe) {
          var i = this.geoannotations[index].approvedBy.map(function(e) {
            return e.withCreator;
          }).indexOf(this.userServices.current.dbId);
          if (i > -1) {
            this.geoannotations[index].approvedBy.splice(i, 1);
          }
          this.geoannotations[index].approvedByMe = false;
        } else {
          if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
            await this.userServices.reloadCurrentUser();
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          } else {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          }
        }
      }
      else if (mot == 'color') {
        this.colorannotations[index].rejectedByMe = true;
        if (this.colorannotations[index].approvedByMe) {
          var i = this.colorannotations[index].approvedBy.map(function(e) {
            return e.withCreator;
          }).indexOf(this.userServices.current.dbId);
          if (i > -1) {
            this.colorannotations[index].approvedBy.splice(i, 1);
          }
          this.colorannotations[index].approvedByMe = false;
        } else {
          if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
            await this.userServices.reloadCurrentUser();
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          } else {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          }
        }
      }
      else if (mot == 'poll') {
        this.pollannotations[index].rejectedByMe = true;
        if (this.pollannotations[index].approvedByMe) {
          var i = this.pollannotations[index].approvedBy.map(function(e) {
            return e.withCreator;
          }).indexOf(this.userServices.current.dbId);
          if (i > -1) {
            this.pollannotations[index].approvedBy.splice(i, 1);
          }
          this.pollannotations[index].approvedByMe = false;
        } else {
          if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
            await this.userServices.reloadCurrentUser();
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          } else {
            this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
          }
        }
      }
    }
  }

  async unscore(annoId, annoType, index, mot) {
    if (annoType == 'approved') {
      //this.annotationServices.unscore(annoId);
      this.annotationServices.unscoreObj(annoId).catch(error => {
        console.log(error.message);
      });
      if (mot == 'tag') {
        var i = this.annotations[index].approvedBy.map(function(e) {
          return e.withCreator;
        }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.annotations[index].approvedBy.splice(i, 1);
        }
        this.annotations[index].approvedByMe = false;
      }
      else if (mot == 'geo') {
        var i = this.geoannotations[index].approvedBy.map(function(e) {
          return e.withCreator;
        }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.geoannotations[index].approvedBy.splice(i, 1);
        }
        this.geoannotations[index].approvedByMe = false;
      }
      else if (mot == 'color') {
        var i = this.colorannotations[index].approvedBy.map(function(e) {
          return e.withCreator;
        }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.colorannotations[index].approvedBy.splice(i, 1);
        }
        this.colorannotations[index].approvedByMe = false;
      }
      else if (mot == 'poll') {
        var i = this.pollannotations[index].approvedBy.map(function(e) {
          return e.withCreator;
        }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.pollannotations[index].approvedBy.splice(i, 1);
        }
        this.pollannotations[index].approvedByMe = false;
      }

      if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
        await this.userServices.reloadCurrentUser();
        this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
      } else {
        this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
      }
    }

    if (annoType == 'rejected') {
      //this.annotationServices.unscore(annoId);
      this.annotationServices.unscoreObj(annoId).catch(error => {
        console.log(error.message);
      });
      if (mot == 'tag') {
        var i = this.annotations[index].rejectedBy.map(function(e) {
          return e.withCreator;
        }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.annotations[index].rejectedBy.splice(i, 1);
        }
        this.annotations[index].rejectedByMe = false;
      }
      else if (mot == 'geo') {
        var i = this.geoannotations[index].rejectedBy.map(function(e) {
          return e.withCreator;
        }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.geoannotations[index].rejectedBy.splice(i, 1);
        }
        this.geoannotations[index].rejectedByMe = false;
      }
      else if (mot == 'color') {
        var i = this.colorannotations[index].rejectedBy.map(function(e) {
          return e.withCreator;
        }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.colorannotations[index].rejectedBy.splice(i, 1);
        }
        this.colorannotations[index].rejectedByMe = false;
      }
      else if (mot == 'poll') {
        var i = this.pollannotations[index].rejectedBy.map(function(e) {
          return e.withCreator;
        }).indexOf(this.userServices.current.dbId);
        if (i > -1) {
          this.pollannotations[index].rejectedBy.splice(i, 1);
        }
        this.pollannotations[index].rejectedByMe = false;
      }

      if ((!this.userServices.isAuthenticated()) || (this.userServices.isAuthenticated() && this.userServices.current === null)) {
        await this.userServices.reloadCurrentUser();
        this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
      } else {
        this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, annoType);
      }
    }
    if (!this.hasContributed()) {
      this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records');
    }
  }

  async getRecordAnnotations(id) {
    if (this.hasMotivation('Polling')) {
      await this.recordServices.getAnnotations(this.recId, 'Polling').then(response => {
        for (var i = 0; i < response.length; i++) {
          //if (response[i].annotators[0].generator == (settings.project+' '+(this.campaign.username))) {
          if (!this.userServices.current) {
            this.pollannotations.push(new Annotation(response[i], ""));
          } else {
            this.pollannotations.push(new Annotation(response[i], this.userServices.current.dbId));
          }
          //}
        }
        // Bring first the annotation associated with the spedific collection
        for (var i in this.pollannotations) {
          if (this.pollannotations[i].label == this.colTitle) {
            let temp = this.pollannotations[0];
            this.pollannotations[0] = this.pollannotations[i];
            this.pollannotations[i] = temp;
            break;
          }
        }
        if (this.pollannotations.length > 0) {
          this.pollTitle = this.pollannotations[0].label;
        }
        else {
          toastr.error('There are no annotations for this record.');
        }
      });
    }
    if (this.hasMotivation('GeoTagging')) {
      await this.recordServices.getAnnotations(this.recId, 'GeoTagging').then(response => {
        this.geoannotations = [];
        for (var i = 0; i < response.length; i++) {
          if (!this.userServices.current) {
            this.geoannotations.push(new Annotation(response[i], ""));
          } else {
            this.geoannotations.push(new Annotation(response[i], this.userServices.current.dbId));
          }
        }
      });
      // Sort the annotations in descending order, based on their score
      this.geoannotations.sort(function(a, b) {
        return b.score - a.score;
      });
    }
    if (this.hasMotivation('Tagging')) {
      await this.recordServices.getAnnotations(this.recId, 'Tagging').then(response => {
        this.annotations = [];
        for (var i = 0; i < response.length; i++) {
          if (!this.userServices.current) {
            this.annotations.push(new Annotation(response[i], ""));
          } else {
            this.annotations.push(new Annotation(response[i], this.userServices.current.dbId));
          }
        }
      });
      // Sort the annotations in descending order, based on their score
      this.annotations.sort(function(a, b) {
        return b.score - a.score;
      });
    }
    if (this.hasMotivation('ColorTagging')) {
      await this.recordServices.getAnnotations(this.recId, 'ColorTagging').then(response => {
        this.colorannotations = [];
        for (var i = 0; i < response.length; i++) {
          if (!this.userServices.current) {
            this.colorannotations.push(new Annotation(response[i], ""));
          } else {
            this.colorannotations.push(new Annotation(response[i], this.userServices.current.dbId));
          }
        }
      });
      // Sort the annotations in descending order, based on their score
      this.colorannotations.sort(function(a, b) {
        return b.score - a.score;
      });
    }
  }

  getColor(label) {
    var index = this.colorSet.findIndex(element => {
      return element[1] == label;
    });
    if (index == -1) {
      return '/img/assets/images/no_image.jpg';
    } else {
      return this.colorSet[index][0];
    }
  }

	getStyle(label) {
    var index = this.colorSet.findIndex(element => {
      return element[0] == label;
    });
    if (index == -1) {
      return '';
    } else {
      return this.colorSet[index][1];
    }
  }

  annotationExists(label) {
    for (var i in this.colorannotations) {
      if (this.colorannotations[i].label == label) {
        return {'id': this.colorannotations[i].dbId, 'index': i};
      }
    }
    return null;
  }

  hasContributed() {
    for (var i in this.annotations) {
      if (this.annotations[i].createdByMe || this.annotations[i].approvedByMe || this.annotations[i].rejectedByMe) {
        return true;
      }
    }
    for (var i in this.geoannotations) {
      if (this.geoannotations[i].createdByMe || this.geoannotations[i].approvedByMe || this.geoannotations[i].rejectedByMe) {
        return true;
      }
    }
    for (var i in this.colorannotations) {
      if (this.colorannotations[i].createdByMe || this.colorannotations[i].approvedByMe || this.colorannotations[i].rejectedByMe) {
        return true;
      }
    }
    for (var i in this.pollannotations) {
      if (this.pollannotations[i].createdByMe || this.pollannotations[i].approvedByMe || this.pollannotations[i].rejectedByMe) {
        return true;
      }
    }
    return false;
  }

  hasMotivation(name) {
    return !!this.campaign.motivation.includes(name);
  }

	goToURI(uri) {
		this.uriRedirect = true;
		window.open(uri);
	}

}
