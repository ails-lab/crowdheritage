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
import {I18N} from 'aurelia-i18n';
import settings from 'global.config.js';

@inject(UserServices, RecordServices, CampaignServices, EventAggregator, AnnotationServices, ThesaurusServices, 'loginPopup', I18N, 'isTesterUser')
export class Tagitem {

  @bindable prefix = '';

  constructor(userServices, recordServices, campaignServices, eventAggregator, annotationServices, thesaurusServices, loginPopup, i18n, isTesterUser) {
    this.i18n = i18n;

		this.colorSet = [
			["Black",       "background-color: #111111", "color: #111111; filter: brightness(500%);"],
			["Grey",        "background-color: #AAAAAA","color: #AAAAAA; filter: brightness(60%);"],
			["Brown",       "background-color: brown", "color:brown; filter: brightness(60%);"],
			["Red",         "background-color: #FF4136","color: #FF4136; filter: brightness(60%);"],
			["Orange",      "background-color: #FF851B", "color: #FF851B; filter: brightness(60%);"],
			["Beige",       "background-color: beige", "color: beige; filter: brightness(60%);"],
			["Yellow",      "background-color: #FFDC00", "color: #FFDC00; filter: brightness(60%);"],
			["Green",       "background-color: #2ECC40", "color: #2ECC40; filter: brightness(60%);"],
			["Blue",        "background-color: #0074D9", "color: #0074D9; filter: brightness(60%);"],
			["Purple",      "background-color: #B10DC9", "color: #B10DC9; filter: brightness(60%);"],
			["Pink",        "background-color: pink", "color: pink; filter: brightness(60%);"],
			["White",       "background-color: #FFFFFF", "color: #FFFFFF; filter: brightness(60%);"],
			["Copper",      "background-image: url(/img/color/copper.jpg)", "color: #b87333; filter: brightness(50%);"],
			["Silver",      "background-image: url(/img/color/silver.jpg)", "color:  #DDDDDD; filter: brightness(30%);"],
			["Bronze",      "background-image: url(/img/color/bronze.jpg)", "color: #cd7f32; filter: brightness(50%);" ],
			["Gold",        "background-image: url(/img/color/gold.jpg)", "color: #FFD700; filter: brightness(50%);"],
			["Multicolor",  "background-image: linear-gradient(to right, red,orange,yellow,green,blue,indigo,violet)", " color: white; text-shadow: 1px 1px 2px #424242;"],
			["Transparent", "", "color: white; text-shadow: 1px 1px 2px #424242;"]
		];

		this.ea = eventAggregator;
    this.userServices = userServices;
    this.recordServices = recordServices;
    this.campaignServices = campaignServices;
    this.annotationServices = annotationServices;
    this.thesaurusServices = thesaurusServices;
    this.isTesterUser = isTesterUser();

    this.placeholderText = this.i18n.tr('item:tag-search-text');
    this.annotations = [];
    this.geoannotations = [];
    this.colorannotations = [];
    this.pollannotations = [];
    this.suggestedAnnotation = {};
    this.suggestionsLoading = false;
    this.suggestedAnnotations =  [];
		this.selectedAnnotation = null;
    this.userId = '';
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

  get suggestionsActive() { return this.suggestedAnnotations.length !== 0; }

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
    if (params.userId) {
      this.userId = params.userId;
    }
		this.loc = window.location.href.split('/')[3];
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
    if (this.isTesterUser && (this.campaign.username === "instruments" || this.campaign.username === "garment-type")) {
      toastr.error("You cannot contribute to this campaign!");
    }
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
    if (this.prefix === '') {
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

  async getSuggestedAnnotations(prefix, lang="all") {
    this.lastRequest = prefix;
    this.suggestionsLoading = true;
		lang = typeof this.loc !== 'undefined' ? this.loc : 'all';
    this.suggestedAnnotations = this.suggestedAnnotations.slice(0, this.suggestedAnnotations.length);
    this.selectedAnnotation = null;
    let self = this;
    await this.thesaurusServices.getCampaignSuggestions(prefix, this.campaign.dbId, lang).then((res) => {
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
    if (this.campaign.status != 'active' && !this.isTesterUser) {
      toastr.error(this.i18n.tr('item:toastr-inactive'));
      return;
    }

	  if(this.userServices.isAuthenticated()==false){
      toastr.error(this.i18n.tr('item:toastr-login'));
      this.lg.call();
			return;
		}

		this.selectedAnnotation = this.suggestedAnnotations.find(obj => {
			return obj.geonameId === geoid
		});
		for (var [i, ann] of this.geoannotations.entries()) {
      if (ann.uri && ann.uri.indexOf(geoid)!=-1) {
        this.prefix = "";
        this.selectedAnnotation = null;
        this.suggestedAnnotations = [];
        toastr.error(this.i18n.tr('item:toastr-geo'));
        if (!ann.approvedByMe) {
          this.score(ann.dbId, 'approved', i, 'geo');
        }
        return;
      }
    }
		this.suggestedAnnotations = [];
		this.errors = this.selectedAnnotation == null;

		if (!this.errors) {
			let self = this;
      if (!this.hasContributed('all')) {
        this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records')
          .catch( (error) => {
            console.log("This ERROR occured : ", error);
          });
      }

			this.annotationServices.annotateGeoRecord(this.recId, geoid, this.campaign.username)
			.then(() => {
				toastr.success('Annotation added.');
				self.ea.publish('annotations-created', self.record);
				self.ea.publish('geotag-created', this.selectedAnnotation);
        this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'created');
        // After annotating, automatically upvote the new annotation
        this.getRecordAnnotations('').then( () => {
          for (var [i, ann] of this.geoannotations.entries()) {
            if (ann.uri && ann.uri.indexOf(geoid)!=-1) {
              this.score(ann.dbId, 'approved', i, 'geo');
              break;
            }
          }
        });
			 	this.prefix = "";
				this.selectedAnnotation = null;
			}).catch((error) => {
				toastr.error(this.i18n.tr('item:toastr-error'));
			});
		}
 	}

  selectSuggestedAnnotation(index) {
    // If the campaign is inactive do NOT validate
    if (this.campaign.status != 'active' && !this.isTesterUser) {
      toastr.error(this.i18n.tr('item:toastr-inactive'));
      return;
    }
    if (this.uriRedirect) {
			this.uriRedirect = false;
			this.prefixChanged();
			return;
		}
    if (this.userServices.isAuthenticated() == false) {
      toastr.error(this.i18n.tr('item:toastr-login'));
      this.lg.call();
			return;
		}

    this.selectedAnnotation = this.suggestedAnnotations.find(obj => {
      return obj.id === index
    });
    let lb = this.selectedAnnotation.label;
    for (var [i, ann] of this.annotations.entries()) {
      if (ann.label.toLowerCase() === lb.toLowerCase()) {
        this.prefix = "";
        this.selectedAnnotation = null;
        this.suggestedAnnotations = [];
        toastr.error(this.i18n.tr('item:toastr-existing'));
        if (!ann.approvedByMe) {
          this.score(ann.dbId, 'approved', i, 'tag');
        }
        return;
      }
    }
    this.suggestedAnnotations = [];
    this.errors = this.selectedAnnotation == null;

    if (!this.errors) {
      let self = this;
      if (!this.hasContributed('all')) {
        this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records')
          .catch( (error) => {
            console.log("This ERROR occured : ", error);
          });
      }

      this.annotationServices.annotateRecord(this.recId, this.selectedAnnotation, this.campaign.username, 'Tagging').then(() => {
        toastr.success('Annotation added.');
        self.ea.publish('annotations-created', self.record);
        this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'created');
        // After annotating, automatically upvote the new annotation
        var lb = this.selectedAnnotation.label;
        this.getRecordAnnotations('').then( () => {
          for (var [i, ann] of this.annotations.entries()) {
            if (ann.label.toLowerCase() === lb.toLowerCase()) {
              this.score(ann.dbId, 'approved', i, 'tag');
              break;
            }
          }
        });
        this.prefix = "";
        this.selectedAnnotation = null;
      }).catch((error) => {
        toastr.error(this.i18n.tr('item:toastr-error'));
      });
    }
  }

  async annotateLabel(label) {
		if (label === 'Multicolor') {
			label = 'Multicoloured';
		}
    // If the campaign is inactive do NOT annotate
    if (this.campaign.status != 'active' && !this.isTesterUser) {
      toastr.error(this.i18n.tr('item:toastr-inactive'));
      return;
    }

    if (this.userServices.isAuthenticated() == false) {
      toastr.error(this.i18n.tr('item:toastr-login'));
      this.lg.call();
      return;
    }
    var answer = this.annotationExists(label);
    if (!answer) {
      // While waiting for the annotation to go through, change the cursor to 'wait'
      document.body.style.cursor = 'wait';
      let clrs = document.getElementsByClassName("color");
      for (let clr of clrs) {
        clr.style.cursor = 'wait';
      }

      if (this.userServices.isAuthenticated() && this.userServices.current === null) {
        await this.userServices.reloadCurrentUser();
      }
      await this.thesaurusServices.getSuggestions(label, this.campaign.vocabularies).then(res => {
        this.suggestedAnnotation = res.results[0];
      });
      if (!this.hasContributed('all')) {
        this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records')
          .catch( (error) => {
            console.log("This ERROR occured : ", error);
          });
      }
      await this.annotationServices.annotateRecord(this.recId, this.suggestedAnnotation, this.campaign.username, 'ColorTagging');
      this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'created');
      // Clear and reload the colorannotations array
      this.colorannotations.splice(0, this.colorannotations.length);
      await this.getRecordAnnotations(this.recId);
      // Try to annotate again, in order to also upvote the new annotation
      await this.annotateLabel(label);
    }
    else if (!this.colorannotations[answer.index].approvedByMe) {
      await this.score(answer.id, 'approved', answer.index, 'color');
    }

    // When the annotation is finished, change the cursor back to 'default'
    document.body.style.cursor = 'default';
    let clrs = document.getElementsByClassName("color");
    for (let clr of clrs) {
      clr.style.cursor = 'default';
    }
  }

  // mot has 3 potential values : [tag, geo, color]
  // depending on which widget called the function
  deleteAnnotation(id, index, mot) {
    if (this.userServices.isAuthenticated() == false) {
      toastr.error(this.i18n.tr('item:toastr-login'));
      this.lg.call();
      return;
    }
		if (this.isCurrentUserCreator()) {
			if (confirm('ATTENTION: This action can not be undone!!\nAre you sure you want to delete the selected annotations?')) {
				console.log("Deleting annotations...");
			}	else {
				return;
			}
		} else {
    // Since on annotating, the user automatically also upvotes the annotation,
    // when deleting an annotation, you should also remove the point from upvoting
    	this.unscore(id, 'approved', index, mot);
		}

    this.annotationServices.delete(id).then(() => {
			let ann;
      if (mot == 'tag') {
        ann = this.annotations.splice(index, 1);
      }
      else if (mot == 'geo') {
        var lt=this.geoannotations[index];
        ann = this.geoannotations.splice(index, 1);
        if (this.campaign.motivation == 'GeoTagging')
  				this.ea.publish('geotag-removed', lt.coordinates);
      }
      else if (mot == 'color') {
        ann = this.colorannotations.splice(index, 1);
      }
      this.reloadAnnotations().then( () => {
					if (this.isCurrentUserCreator()) {
						console.log(ann[0]);
							// Remove one point from each of the upvoters
							for (let upvoter of ann[0].approvedBy) {
								this.campaignServices.decUserPoints(this.campaign.dbId, upvoter.withCreator, 'approved');
							}
							// Remove one point from each of the annotators
							for (let annotator of ann[0].createdBy) {
								this.campaignServices.decUserPoints(this.campaign.dbId, annotator.withCreator, 'created');
							}
					} else {
          	this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'created');
          	if (!this.hasContributed('all')) {
            	this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records')
              	.catch( (error) => {
                	console.log("This ERROR occured : ", error);
              	});
          	}
					}
        });
    }).catch(error => {
      console.log(error.message);
    });
  }

  async validate(annoId, annoType, index, approvedByMe, rejectedByMe, mot) {
    // If the campaign is inactive do NOT validate
    if (this.campaign.status != 'active' && !this.isTesterUser) {
      toastr.error(this.i18n.tr('item:toastr-inactive'));
      return;
    }

    if (this.userServices.isAuthenticated() == false) {
      toastr.error(this.i18n.tr('item:toastr-login'));
      this.lg.call();
      return;
    }

    if (((annoType == 'approved') && approvedByMe) || ((annoType == 'rejected') && rejectedByMe))
      await this.unscore(annoId, annoType, index, mot);
    else
      await this.score(annoId, annoType, index, mot);

    if (mot == 'poll') {
      this.ea.publish('pollAnnotationAdded');
    }
  }

  async score(annoId, annoType, index, mot) {
    if (!this.hasContributed('all')) {
      this.campaignServices.incUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records')
        .catch( (error) => {
          console.log("This ERROR occured : ", error);
        });
    }

    if (annoType == 'approved') {
      //this.annotationServices.approve(annoId);
      if (mot == 'tag') {
        this.RejectFlag = this.annotations[index].rejectedByMe;
      }
      else if (mot == 'geo') {
        this.RejectFlag = this.geoannotations[index].rejectedByMe;
      }
      else if (mot == 'color') {
        this.RejectFlag = this.colorannotations[index].rejectedByMe;
      }
      else if (mot == 'poll') {
        this.RejectFlag = this.pollannotations[index].rejectedByMe;
      }


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


        this.annotationServices.getAnnotation(annoId).then(response => {
          //If after approval the score is equal (approved = rejected) it means that this annotation had bad karma and now must change -> reduce Karma points of the creator
          if (response.score.approvedBy!=null && response.score.rejectedBy!=null){
            if (this.RejectFlag) {
              if((response.score.approvedBy.length - response.score.rejectedBy.length == 2) || (response.score.approvedBy.length - response.score.rejectedBy.length == 1)) {
                this.campaignServices.decUserPoints(this.campaign.dbId, response.annotators[0].withCreator, "karmaPoints")
              }
            }
            else{
              if(response.score.approvedBy.length - response.score.rejectedBy.length == 1) {
                this.campaignServices.decUserPoints(this.campaign.dbId, response.annotators[0].withCreator, "karmaPoints")
              }
            }
          }
        });

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
      if (mot == 'tag') {
        this.ApproveFlag = this.annotations[index].approvedByMe;
      }
      else if (mot == 'geo') {
        this.ApproveFlag = this.geoannotations[index].approvedByMe;
      }
      else if (mot == 'color') {
        this.ApproveFlag = this.colorannotations[index].approvedByMe;
      }
      else if (mot == 'poll') {
        this.ApproveFlag = this.pollannotations[index].approvedByMe;
      }

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

        this.annotationServices.getAnnotation(annoId).then(response => {
          //If after rejection  rejected - approved = 1 it means that this annotation was ok but now has bad karma and must change -> increase Karma points of the creator
          if (response.score.approvedBy!=null && response.score.rejectedBy!=null){
            if (this.ApproveFlag) {
              if((response.score.rejectedBy.length - response.score.approvedBy.length == 0) || (response.score.rejectedBy.length - response.score.approvedBy.length == 1)) {
                this.campaignServices.incUserPoints(this.campaign.dbId, response.annotators[0].withCreator, "karmaPoints")
              }
            }
            else{
              if(response.score.rejectedBy.length - response.score.approvedBy.length == 0) {
                this.campaignServices.incUserPoints(this.campaign.dbId, response.annotators[0].withCreator, "karmaPoints")
              }
            }
          }

        });

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
      this.annotationServices.unscoreObj(annoId).then(response1 => {
        this.annotationServices.getAnnotation(annoId).then(response => {
          //If after approved unscore rejected - approved = 1 it means that this annotation was ok but now has bad karma and must change -> increase Karma points of the creator
          if (response.score.approvedBy!=null && response.score.rejectedBy!=null){
            if(response.score.rejectedBy.length - response.score.approvedBy.length == 0) {
              this.campaignServices.incUserPoints(this.campaign.dbId, response.annotators[0].withCreator, "karmaPoints")
            }
          }
        })
        .catch(error => {
          console.log("Couldn't find annotation with id:", annoId);
          console.log(error.message);
        });
      }).catch(error => {
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
      this.annotationServices.unscoreObj(annoId).then(response => {
        this.annotationServices.getAnnotation(annoId).then(response => {
          //If after rejected unscore the score is equal (approved = rejected) it means that this annotation had bad karma and now must change -> reduce Karma points of the creator
          if (response.score.approvedBy!=null && response.score.rejectedBy!=null){
            if(response.score.approvedBy.length - response.score.rejectedBy.length == 1) {
              this.campaignServices.decUserPoints(this.campaign.dbId, response.annotators[0].withCreator, "karmaPoints")
            }
          }
        });
      }).catch(error => {
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
    if (!this.hasContributed('all')) {
      this.campaignServices.decUserPoints(this.campaign.dbId, this.userServices.current.dbId, 'records')
        .catch( (error) => {
          console.log("This ERROR occured : ", error);
        });
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
          toastr.info(this.i18n.tr('item:toastr-empty'));
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
            this.annotations.push(new Annotation(response[i], "", this.loc));
          } else {
            this.annotations.push(new Annotation(response[i], this.userServices.current.dbId, this.loc));
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
          // Filter the annotations based on the generator
          var flag = false;
          for (var annotator of response[i].annotators) {
            if ( (annotator.generator == (settings.project+' '+(this.campaign.username)))
              || (annotator.generator == 'Image Analysis') ) {
                flag = true;
                break;
            }
          }
          // If the criterias are met, push the annotation inside the array
          if (flag) {
            if (response[i].body.label.en && response[i].body.label.en=="gray") {
              response[i].body.label.en = ["grey"];
              response[i].body.label.default = ["grey"];
            }
            if (!this.userServices.current) {
              this.colorannotations.push(new Annotation(response[i], ""));
            } else {
              this.colorannotations.push(new Annotation(response[i], this.userServices.current.dbId));
            }
          }
        }
      });
      // Sort the annotations in descending order, based on their score
      this.colorannotations.sort(function(a, b) {
        return b.score - a.score;
      });
    }
  }

  getColorLabel(label) {
    return this.i18n.tr('item:color:'+label);
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
		label = (label === 'Multicoloured') ? 'Multicolor' : label;
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

  hasContributed(mot) {
    var tagFlag = false;
    var geoFlag = false;
    var colorFlag = false;
    var pollFlag = false;

    for (var i in this.annotations) {
      if (this.annotations[i].createdByMe || this.annotations[i].approvedByMe || this.annotations[i].rejectedByMe) {
        tagFlag = true;
        break;
      }
    }
    for (var i in this.geoannotations) {
      if (this.geoannotations[i].createdByMe || this.geoannotations[i].approvedByMe || this.geoannotations[i].rejectedByMe) {
        geoFlag = true;
        break;
      }
    }
    for (var i in this.colorannotations) {
      if (this.colorannotations[i].createdByMe || this.colorannotations[i].approvedByMe || this.colorannotations[i].rejectedByMe) {
        colorFlag = true;
        break;
      }
    }
    for (var i in this.pollannotations) {
      if (this.pollannotations[i].createdByMe || this.pollannotations[i].approvedByMe || this.pollannotations[i].rejectedByMe) {
        pollFlag = true;
        break;
      }
    }

    if (mot == "tag") {
      return tagFlag;
    }
    else if (mot == "geo") {
      return geoFlag;
    }
    else if (mot == "color") {
      return colorFlag;
    }
    else if (mot == "poll") {
      return pollFlag;
    }
    else {
      return tagFlag || geoFlag || colorFlag || pollFlag;
    }
  }

  hasMotivation(name) {
    return !!this.campaign.motivation.includes(name);
  }

  isCreatedBy(ann) {
    return ( ann.createdBy[0].withCreator == this.userId );
  }

  isValidatedBy(ann, valType) {
    if (valType == 'approved') {
      for (let anno of ann.approvedBy) {
        if (anno.withCreator == this.userId) {
          return true;
        }
      }
    }
    else if (valType == 'rejected') {
      for (let anno of ann.rejectedBy) {
        if (anno.withCreator == this.userId) {
          return true;
        }
      }
    }
    else if (valType == 'all') {
      // If not in user-page, always return TRUE, since there we don't filter the annotation list
      if (this.userId.length == 0) {
        return true;
      }
      for (let anno of ann.approvedBy) {
        if (anno.withCreator == this.userId) {
          return true;
        }
      }
      for (let anno of ann.rejectedBy) {
        if (anno.withCreator == this.userId) {
          return true;
        }
      }
    }
    return false;
  }

  isValidUrl(uri) {
    return uri.startsWith("http");
  }

	goToURI(uri) {
    console.log(uri);
		this.uriRedirect = true;
		window.open(uri);
	}

  clearSearchField() {
    this.prefix = '';
  }

	isCurrentUserCreator() {
		return this.campaign.creators.includes(this.userServices.current.dbId);
	}

}
