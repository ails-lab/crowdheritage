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
import { Router } from 'aurelia-router';
import { Annotation } from 'Annotation.js';
import { AnnotationServices } from 'AnnotationServices.js';
import { ThesaurusServices } from 'ThesaurusServices.js';
import { Campaign } from 'Campaign.js';
import { CampaignServices } from 'CampaignServices.js';
import { Record } from 'Record.js';
import { RecordServices } from 'RecordServices.js';
import { UserServices } from 'UserServices';
import { I18N } from 'aurelia-i18n';
import settings from 'global.config.js';
import { IterateObjectValueConverter } from '../../converters/iterate-object.js';

let instance = null;
let COUNT = 24;

@inject(AnnotationServices, ThesaurusServices, CampaignServices, RecordServices, UserServices, Router, I18N)
export class Validation {

  constructor(annotationServices, thesaurusServices, campaignServices, recordServices, userServices, router, i18n) {
  	if (instance) {
  		return instance;
  	}
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
    this.annotationServices = annotationServices;
    this.thesaurusServices = thesaurusServices;
  	this.campaignServices = campaignServices;
    this.recordServices = recordServices;
  	this.userServices = userServices;
  	this.router = router;
  	this.i18n = i18n;

  	this.loc;
    this.project = settings.project;

    this.isCreator = false;
    this.campaignItem = null;
    this.recordIds = [];
    this.records = [];
    this.record = null;
    this.annotation = null;
    this.offset = 0;
    this.label = "";
    this.generators = [];
    this.annotationsToDelete = [];
    this.sortBy = "upvoted";
    this.placeholderText = this.i18n.tr('item:tag-search-text');
    this.exportLabel = "EXPORT ANNOTATIONS TO JSON";

    this.annotations = [];
    this.geoannotations = [];
    this.colorannotations = [];
    this.pollannotations = [];
    this.suggestedAnnotations = [];
    this.suggestedAnnotation = null;
    this.suggestedGeoAnnotations = [];
    this.suggestedGeoAnnotation = null;
    this.suggestionsLoading = false;
		this.selectedAnnotation = null;
    this.selectedGeoAnnotation = null;
		this.uriRedirect = false;
    this.popularTags = null;
    this.popularColorTags = null;
    this.popularGeoTags = null;
    this.popularPollTags = {
      "Wolfgang Amadeus Mozart" : 801,
      "Béla Bartók" : 358,
      "Franz Liszt" : 351,
      "Ludwig van Beethoven" : 326,
      "Johann Sebastian Bach" : 276,
      "Joseph Haydn" : 163,
      "Leonard Bernstein" : 94,
      "Antonín Dvořák" : 69,
      "Igor Stravinsky" : 69,
      "Jean-Philippe Rameau" : 62
    };

    this.loadCamp = false;
    this.loading = false;
    this.deleting = false;
  	if (!instance) {
  		instance = this;
  	}
  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }
  get user()            { return this.userServices.current; }
  get more()            { return this.offset < this.recordIds.length; }

  scrollToTop() {
    window.scrollTo(0,0);
  }

  clearSearchField() {
    this.prefix = '';
    this.geoPrefix = '';
    this.suggestedAnnotations = [];
  }

  hasMotivation(name) {
    return !!this.campaign.motivation.includes(name);
  }

  hasColourTag() {
		if(this.cname==="colours-catwalk")
		   return true;
		else
      return false;
  }

  containsAnnotation() {
    for (let ann of this.annotationsToDelete) {
      if (ann.dbId === this.annotation.dbId) {
        return true;
      }
    }
    return false;
  }

  getColorLabel(label) {
    return this.i18n.tr('item:color:'+label);
  }

  toggleSortMenu() {
    if ($('.sort').hasClass('open')) {
      $('.sort').removeClass('open');
    }
    else {
      $('.sort').addClass('open');
    }
  }

  attached() {
    $('.accountmenu').removeClass('active');
    // window.addEventListener('scroll', e => this.scrollAndLoadMore());
  }

  detached() {
		this.record=null;
	}

  clearInstance() {
    this.campaignItem = null;
    this.recordIds = [];
    this.records = [];
    this.record = null;
    this.annotation = null;
    this.offset = 0;
    this.label = "";
    this.generators = [];
    this.annotationsToDelete = [];
    this.sortBy = "upvoted";
    this.placeholderText = this.i18n.tr('item:tag-search-text');
    this.exportLabel = "EXPORT ANNOTATIONS TO JSON";

    this.prefix = '';
    this.geoPrefix = '';
    this.annotations = [];
    this.geoannotations = [];
    this.colorannotations = [];
    this.pollannotations = [];
    this.suggestedAnnotations = [];
    this.suggestedAnnotation = null;
    this.suggestedGeoAnnotations = [];
    this.suggestedGeoAnnotation = null;
    this.suggestionsLoading = false;
		this.selectedAnnotation = null;
    this.selectedGeoAnnotation = null;
		this.uriRedirect = false;

    this.loadCamp = false;
    this.loading = false;
    this.deleting = false;
  }

	async activate(params, route) {
    this.clearInstance();

    this.loc = params.lang;
		this.i18n.setLocale(params.lang);

		this.cname = params.cname;
    this.loadCamp = true;
    let result = await this.campaignServices.getCampaignByName(params.cname)
      .then(response => {
        // Based on the selected language, set the campaign
        this.campaign = new Campaign(response, this.loc);
        this.isCreator = this.campaign.creators.includes(this.user.dbId);

        // if (!this.isCreator) {
        //   let index = this.router.routes.find(x => x.name === 'index');
        //   this.router.navigateToRoute('index', {lang: 'en'});
        // }

        this.campaignServices.getPopularAnnotations(this.campaign.username)
          .then( response => {
            this.popularTags = response;
          });
      })
      .catch(error => {
        let index = this.router.routes.find(x => x.name === 'index');
        this.router.navigateToRoute('index', {lang: 'en'});
      });
    this.loadCamp = false;

    route.navModel.setTitle('Validation | ' + this.campaign.title);
	}

  getSortbyLabel(sortBy) {
    if (sortBy == "upvoted")
      return 'UPVOTES';
    else if (sortBy == "downvoted")
      return 'DOWNVOTES';
    else if (sortBy == "neutral")
      return 'SCORE';
    else
      return '-';
  }

  selectLabel(label, sortBy, reload, index) {
    // If the label is the already selected label, do nothing
    if ( !reload && (this.sortBy === sortBy) && (this.label === label.toLowerCase()) ) {
      return;
    }

    this.loading = true;
    // Clear the previously retrieved records
    this.annotationsToDelete.splice(0, this.annotationsToDelete.length);
    $('.validation-button-group').addClass('hiddenfile');
    $('.validation-info').addClass('hiddenfile');
    this.recordIds.splice(0, this.recordIds.length);
    this.records.splice(0, this.records.length);
    this.offset = 0;

    if (this.hasMotivation('ColorTagging')) {
      // Keep enlarged the selected color in the palette
      $('.enlarge-color').removeClass('enlarge-color');
      let colorClass = label[0].toUpperCase() + label.slice(1,label.length);
      colorClass = (colorClass === "Multicoloured") ? "Multicolor" : colorClass;
      $('.'+colorClass).addClass('enlarge-color');

      // Restore the original color-label form, which is lowercase
      this.label = label.toLowerCase();
      if (this.label === 'multicolor') {
        this.label = 'multicoloured';
      }
    }
    else {
      this.label = label;
    }

    if (index != null) {
      $('.selected-tag').removeClass('selected-tag');
      $('.tag-'+index).addClass('selected-tag');
    }
    else {
      $('.selected-tag').removeClass('selected-tag');
    }

    // Set up the query parameters for the new RecordIds retrieval
    this.sortBy = sortBy;
    this.generators.splice(0, this.generators.length);
    this.generators.push(this.project + " " + this.campaign.username);
    if (this.campaign.username == "colours-catwalk") {
      this.generators.push("Image Analysis");
    }
    // Retrieve the new recordIds array
    this.recordServices.getRecordIdsByAnnLabel(this.label, this.generators, this.sortBy)
      .then( response => {
        this.recordIds = response;
        // console.log("RESPONSE", response);
        // Fill the record array with the first batch of records
        this.getRecords(0);
        this.suggestedAnnotations = [];
        this.prefix = label;
      })
      .catch(error => {
        console.error(error.message);
      });
  }

	async getRecords(offset) {
    // Clone the recordIds array
    let recIds = this.recordIds.slice(0, this.recordIds.length);
    // Keep only the next batch in the array
    recIds.splice(0, offset);
    recIds.splice(COUNT, recIds.length-COUNT);
    // Retrieve the records
    this.recordServices.getMultipleRecords(recIds)
      .then ( results => {
        this.offset = this.offset + COUNT;
        this.fillRecordArray(results);
      })
      .catch(error => {
        console.error(error.message);
      });
	}

  fillRecordArray(records) {
    for (let i in records) {
      let recordData = records[i];
      if (recordData !== null) {
        this.records.push(new Record(recordData));
      }
    }
    this.loading = false;
  }

  quickView(record){
	  this.record=record;
		$('.action').removeClass('active');
		$('.action.itemview').addClass('active');
  }

  async findAnnotation(record) {
    let camelLabel = this.label.charAt(0).toUpperCase() + this.label.slice(1);
    let found = false;
    await this.getRecordAnnotations(record.dbId);

    if (this.hasMotivation('ColorTagging')) {
      for (let ann of this.colorannotations) {
        if (ann.label === camelLabel) {
          this.annotation = ann;
          found = true;
        }
      }
    }
    if (this.hasMotivation('Tagging')) {
      for (let ann of this.annotations) {
        if (ann.label === camelLabel) {
          this.annotation = ann;
          found = true;
        }
      }
    }
    if (this.hasMotivation('GeoTagging')) {
      for (let ann of this.geoannotations) {
        if (ann.label === camelLabel) {
          this.annotation = ann;
          found = true;
        }
      }
    }
    if (this.hasMotivation('Polling')) {
      for (let ann of this.pollannotations) {
        if (ann.label === camelLabel) {
          this.annotation = ann;
          found = true;
        }
      }
    }

    if (!found) {
      this.annotation = null;
    }
  }

  async selectAnnotation(record) {
    await this.findAnnotation(record);
    if (this.annotation == null) {
      toastr.error("The annotation failed to get selected");
      return;
    }

    if (this.containsAnnotation()) {
      // If the annotation is already selected, unselect it, instead
      this.unselectAnnotation(record);
      return;
    }
    else {
      // Select which annotations to discard
      $('.'+record.dbId+' .thumbs').addClass('discardAnnotation');
      $('.'+record.dbId+' .fa-trash').removeClass('hiddenfile');
      this.annotationsToDelete.push(this.annotation);
    }
    $('.validation-button-group').removeClass('hiddenfile');
    $('.validation-info').removeClass('hiddenfile');
    // console.log("[SELECT] ANNOTATIONS TO DELETE:", this.annotationsToDelete);
  }

  unselectAnnotation(record) {
    if (this.annotation == null) {
      toastr.error("The annotation failed to get selected");
      return;
    }
    // Undo the selection of an annotation
    for (let i in this.annotationsToDelete) {
      if (this.annotationsToDelete[i].dbId === this.annotation.dbId) {
        this.annotationsToDelete.splice(i, 1);
        $('.'+record.dbId+' .thumbs').removeClass('discardAnnotation');
        $('.'+record.dbId+' .fa-trash').addClass('hiddenfile');
        // console.log("[UNSELECT] ANNOTATIONS TO DELETE:", this.annotationsToDelete);
        if (this.annotationsToDelete.length == 0) {
          $('.validation-button-group').addClass('hiddenfile');
          $('.validation-info').addClass('hiddenfile');
        }
        return;
      }
    }
    toastr.error("The annotation failed to get unselected");
  }

  clearSelections() {
    // Cancel the selections you made
    this.annotationsToDelete.splice(0, this.annotationsToDelete.length);
    $('.discardAnnotation').removeClass('discardAnnotation');
    $('.fa-trash').addClass('hiddenfile');
    $('.validation-button-group').addClass('hiddenfile');
    $('.validation-info').addClass('hiddenfile');
    // console.log("[CLEAR] ANNOTATIONS TO DELETE:", this.annotationsToDelete);
  }

  deleteAnnotations() {
    if (this.annotationsToDelete.length == 0) {
      toastr.error("You have not selected any annotations");
      return;
    }
    if ( !this.isAuthenticated || !this.isCreator ) {
      toastr.error("You have no permission to perform this action");
      return;
    }
    if (confirm('ATTENTION: This action can not be undone!!\n\nAre you sure you want to delete the selected annotations?')) {
      console.log("Deleting annotations...");
    }
    else {
      return;
    }

    // Discard the selected annotations
    for (var ann of this.annotationsToDelete) {
      this.annotationServices.delete(ann.dbId)
      .then( () => {
        // Remove one point from each of the upvoters
        for (let upvoter of ann.approvedBy) {
          this.campaignServices.decUserPoints(this.campaign.dbId, upvoter.withCreator, 'approved');
        }
        // Remove one point from each of the annotators
        for (let annotator of ann.createdBy) {
          this.campaignServices.decUserPoints(this.campaign.dbId, annotator.withCreator, 'created');
        }
        // Refresh the view
        this.annotationsToDelete.splice(0, this.annotationsToDelete.length);
        this.selectLabel(this.label, this.sortBy, true);
        let camelLabel = this.label.charAt(0).toUpperCase() + this.label.slice(1);
        $('.'+camelLabel).addClass('enlarge-color');
        $('.validation-button-group').addClass('hiddenfile');
        $('.validation-info').addClass('hiddenfile');
        // console.log("[DELETE] ANNOTATIONS TO DELETE:", this.annotationsToDelete);
      })
      .catch(error => {
        console.log(error.message);
        toastr.error("An error occured during the annotation deletion.");
      });
    }
  }

  exportAnnotations() {
    if ( !this.isAuthenticated || !this.isCreator ) {
      toastr.error("You have no permission to perform this action");
      return '';
    }

    if (this.exportLabel === "EXPORTING...") {
      return;
    }

    // While waiting for the process to go through, change the cursor to 'wait'
    let expLink = document.getElementById('exportLink');
    document.body.style.cursor = 'wait';
    expLink.style.cursor = 'wait';
    this.exportLabel = "EXPORTING...";

    this.campaignServices.getCampaignAnnotations(this.campaign.username)
      .then( response => {
        // Create the downloadable json file and download it
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", this.campaign.username+".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

        // When the process is finished, change the cursor back to 'default'
        document.body.style.cursor = 'default';
        expLink.style.cursor = 'pointer';
        this.exportLabel = "EXPORT ANNOTATIONS TO JSON";
      });
  }

  publishToEuropeana() {
    if ( !this.isAuthenticated || !this.isCreator ) {
      toastr.error("You have no permission to perform this action");
      return;
    }
    if (confirm('ATTENTION: This action can not be undone!!\n\nAre you sure you want to publish your campaign annotations to Europeana?')) {
      console.log("Publishing annotations...");
    }
    else {
      return;
    }

    // LOGIC GOES HERE
  }

  // DOES NOT WORK : IT LOADS THE SAME IMAGES
  scrollAndLoadMore() {
		if (($("#recs").height() - window.scrollY < 900 ) && !this.loading && this.more )
    this.loading = true;
	 		this.getRecords(this.offset);
	}

  async loadMore() {
    this.loading = true;
		this.getRecords(this.offset);
  }


  /**
    * TAGITEM WIDGET METHODS
    */
  prefixChanged(geo=false) {
    if (!geo && this.prefix === '') {
      this.suggestedAnnotations = [];
      return;
    }
    if (geo && this.geoPrefix === '') {
      this.suggestedGeoAnnotations = [];
      return;
    }
		if (geo || this.campaign.motivation == 'GeoTagging') {
      this.selectedGeoAnnotation = null;
			this.getGeoAnnotations(this.geoPrefix);
		}
    else {
      this.selectedAnnotation = null;
			this.getSuggestedAnnotations(this.prefix);
		}
  }

  get suggestionsActive() {
    return this.suggestedAnnotations.length !== 0;
  }

  get geoSuggestionsActive() {
    return this.suggestedGeoAnnotations.length !== 0;
  }

  async getSuggestedAnnotations(prefix, lang="all") {
    this.lastRequest = prefix;
    this.suggestionsLoading = true;
		lang = typeof this.loc !== 'undefined' ? this.loc : 'all';
    this.suggestedAnnotations = this.suggestedAnnotations.slice(0, this.suggestedAnnotations.length);
    this.selectedAnnotation = null;
    let self = this;
    this.campaignServices.getPopularAnnotations(this.campaign.username, prefix)
      .then( res => {
        let response = new IterateObjectValueConverter().toView(res);
        self.suggestedAnnotations = response;
        self.suggestionsLoading = false;
      });
    // await this.thesaurusServices.getCampaignSuggestions(prefix, this.campaign.dbId, lang).then((res) => {
    //   console.log("RES", res);
    //   console.log("LAST", self.lastRequest);
    //   if (res.request === self.lastRequest) {
    //     self.suggestedAnnotations = res.results;
    //     if (self.suggestedAnnotations.length > 0 && self.suggestedAnnotations[0].exact) {
    //       self.selectedAnnotation = self.suggestedAnnotations[0];
    //     }
    //     self.suggestionsLoading = false;
    //   }
    // });
  }

  async getGeoAnnotations(prefix) {
		this.lastRequest = prefix;
		this.suggestionsLoading = true;
		this.suggestedGeoAnnotations = this.suggestedGeoAnnotations.slice(0, this.suggestedGeoAnnotations.length);
		this.selectedGeoAnnotation = null;
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
		this.suggestedGeoAnnotations = geonames;
    let geoLength = this.suggestedGeoAnnotations.length;

		this.suggestionsLoading = false;
	}

  selectSuggestedAnnotation(index) {
    if (this.uriRedirect) {
			this.uriRedirect = false;
			this.prefixChanged();
			return;
		}

    this.selectedAnnotation = this.suggestedAnnotations.find(obj => {
      return obj.id === index
    });
    this.suggestedAnnotations = [];
    this.errors = this.selectedAnnotation == null;

    if (!this.errors) {
      var lb = this.selectedAnnotation.label;
      this.prefix = lb;

      this.selectLabel(lb, 'upvoted', false);
    }
  }

  selectGeoAnnotation(geoid) {
    this.selectedGeoAnnotation = this.suggestedGeoAnnotations.find(obj => {
			return obj.geonameId === geoid
		});
		this.suggestedGeoAnnotations = [];
		this.errors = this.selectedGeoAnnotation == null;

		if (!this.errors) {
      var lb = this.selectedGeoAnnotation.name;
      this.geoPrefix = lb;

      this.selectLabel(lb, 'upvoted', false);
		}
 	}

  async getRecordAnnotations(id) {
    if (this.hasMotivation('Polling')) {
      await this.recordServices.getAnnotations(id, 'Polling').then(response => {
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
      });
    }
    if (this.hasMotivation('GeoTagging')) {
      await this.recordServices.getAnnotations(id, 'GeoTagging').then(response => {
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
      await this.recordServices.getAnnotations(id, 'Tagging').then(response => {
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
      await this.recordServices.getAnnotations(id, 'ColorTagging').then(response => {
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
}
