import { inject } from 'aurelia-framework';
import { CollectionServices } from 'CollectionServices.js';
import { MediaServices } from 'MediaServices.js';
import { CampaignServices } from 'CampaignServices.js';
import { UserServices } from 'UserServices.js';
import { GroupServices } from 'GroupServices.js';
import { ThesaurusServices } from 'ThesaurusServices.js';
import { Router } from 'aurelia-router';
import { I18N } from 'aurelia-i18n';
import { Campaign } from 'Campaign.js';
import settings from 'global.config.js';

let instance = null;

@inject(CollectionServices, MediaServices, CampaignServices, UserServices, GroupServices, ThesaurusServices, Router, I18N, 'pageLocales')
export class CampaignEdit {

  constructor(collectionServices, mediaServices, campaignServices, userServices, groupServices, thesaurusServices, router, i18n, pageLocales) {
    this.DEFAULT_BANNER = 'http://withculture.eu/assets/img/content/background-space.png';
    if (instance) {
      return instance;
    }
    this.collectionServices = collectionServices;
    this.mediaServices = mediaServices;
    this.campaignServices = campaignServices;
    this.userServices = userServices;
    this.groupServices = groupServices;
    this.thesaurusServices = thesaurusServices;
    this.router = router;
    this.i18n = i18n;

    this.loc;
    this.locales = pageLocales();
    this.currentLocale = this.locales[0]; // default language for form language picker
    this.loading = false;

    this.campaign = null;
    this.prizes = ['gold', 'silver', 'bronze', 'rookie'];
    this.motivations = ['Tagging', 'GeoTagging', 'ColorTagging', 'Commenting', 'ImageTagging'];
    this.purposes = ['ANNOTATE', 'VALIDATE'];
    this.orientations = ['DATA', 'METADATA'];
    this.feedbackMethods = ['UPVOTE', 'RATE'];
    this.motivationValues = {Tagging: false, GeoTagging: false, ColorTagging: false, Commenting: false, ImageTagging: false};
    this.availableVocabularies = [];
    this.selectedVocabularies = [];
    this.vocabulariesIndexing = {tagType: ''};
    this.suggestedNames = [];
    this.suggestedGroupNames = [];
    this.suggestedColNames = [];
    this.moderators = [];
    this.userGroups = [];
    this.tagGroups = [];
    this.selectedCollections = [];
    this.baseAnnotations = {
      MINT: [],
      FILE: []
    };
    this.annotationsUpload = {
      MINT: {
        status: '',
        motivation: '',
        url: ''
      },
      FILE: {
        status: '',
        motivation: '',
        fileName: '',
        file: null
      }
    };
    this.errors = {};

    if (!instance) {
      instance = this;
    }
  }

  clearInstance() {
    this.campaign = null;
    this.prizes = ['gold', 'silver', 'bronze', 'rookie'];
    this.motivations = ['Tagging', 'GeoTagging', 'ColorTagging', 'Commenting', 'ImageTagging'];
    this.motivationValues = {Tagging: false, GeoTagging: false, ColorTagging: false, Commenting: false, ImageTagging: false};
    this.availableVocabularies = [];
    this.selectedVocabularies = [];
    this.vocabulariesIndexing = {tagType: ''};
    this.suggestedNames = [];
    this.suggestedGroupNames = [];
    this.suggestedColNames = [];
    this.moderators = [];
    this.userGroups = [];
    this.tagGroups = [];
    this.selectedCollections = [];
    this.baseAnnotations = {
      MINT: [],
      FILE: []
    };
    this.annotationsUpload = {
      MINT: {
        status: '',
        motivation: '',
        url: ''
      },
      FILE: {
        status: '',
        motivation: '',
        fileName: '',
        file: null
      }
    };
  }

  get suggestionsActive() { return this.suggestedNames.length !== 0; }
  get gsuggestionsActive() { return this.suggestedGroupNames.length !== 0; }
  get csuggestionsActive() { return this.suggestedColNames.length !== 0; }
  get isAuthenticated() { return this.userServices.isAuthenticated(); }
  get user() { return this.userServices.current; }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  async activate(params, route) {
    // Check if user is logged in and has elevated access
    if (!this.userServices.isAuthenticated() || !this.userServices.current.isEditor) {
      this.router.navigateToRoute('index', {lang: this.locale});
    }

    this.loc = params.lang;
    this.i18n.setLocale(params.lang);
    this.cname = params.cname;

    await this.loadCampaign();
    let title = this.campaign.title ? this.campaign.title : this.campaign.username;
    route.navModel.setTitle('Edit Campaign | ' + title);
  }

  async loadCampaign() {
    this.loading = true;
    this.clearInstance();
    let campaignData = await this.campaignServices.getCampaignByName(this.cname);
    this.campaign = new Campaign(campaignData, this.loc);

    this.campaign.startDate = this.campaign.startDate.replaceAll('/','-');
    this.campaign.endDate = this.campaign.endDate.replaceAll('/','-');

    if (this.campaign.baseAnnotations) {
      this.baseAnnotations.MINT = this.campaign.baseAnnotations.filter(ba => ba.source === 'MINT');
      this.baseAnnotations.FILE = this.campaign.baseAnnotations.filter(ba => ba.source === 'FILE');
    }

    if (this.campaign.motivation) {
      for (let mot of this.campaign.motivation) {
        this.motivationValues[mot] = true;
      }
    }

    this.selectedVocabularies = this.campaign.vocabularies ? this.campaign.vocabularies : [];
    this.selectedVocabularies.forEach(voc => {
      this.vocabulariesIndexing[voc] = false;
    });

    this.thesaurusServices.listVocabularies()
      .then(response => {
        this.availableVocabularies = response;
        function compareName(a, b) {
          if ( a.name.toLowerCase() < b.name.toLowerCase() ){
            return -1;
          }
          if ( a.name.toLowerCase() > b.name.toLowerCase() ){
            return 1;
          }
          return 0;
        }
        this.availableVocabularies.sort(compareName);
      });

    if (this.campaign.creators) {
      for (let userId of this.campaign.creators) {
        this.userServices.getUser(userId)
          .then(response => {
            this.moderators.push(new Object({id: response.dbId, name: response.username}));
          })
          .catch(error => console.error(error));
      }
    }

    if (this.campaign.userGroupIds) {
      for (let groupId of this.campaign.userGroupIds) {
        this.groupServices.getGroup(groupId)
          .then(response => {
            this.userGroups.push(new Object({id: response.dbId, name: response.username}));
          })
          .catch(error => console.error(error));
      }
    }

    if (this.campaign.vocabularyMapping) {
      this.campaign.vocabularyMapping.forEach(entry => {
        let mapping = Object.assign({}, this.vocabulariesIndexing);
        Object.keys(mapping).forEach(mapKey => mapping[mapKey] = entry.vocabularies.includes(mapKey) ? true : false);
        mapping.tagType = entry.labelName;
        this.tagGroups.push(mapping);
      });
    }

    if (this.campaign.targetCollections) {
      this.collectionServices.getMultipleCollections(this.campaign.targetCollections, 0, this.campaign.targetCollections.length)
        .then(response => {
          if (response.length > 0) {
          	for (let col of response) {
              let title = col.descriptiveData.label[this.loc] && col.descriptiveData.label[this.loc] !== '' ? col.descriptiveData.label[this.loc] : col.descriptiveData.label.default;
              this.selectedCollections.push(new Object({id: col.dbId, name: title}));
            }
  				}
  			})
        .catch(error => console.error(error));
    }

    this.loading = false;
  }

  displayImage(img) {
    return (!img.startsWith('http')) ? `${settings.baseUrl}${img}` : img;
  }

  addCollection(col) {
    this.hideSuggestions('col');
    for (let collection of this.selectedCollections) {
      if (collection.id == col.id) {
        return;
      }
    }
    this.selectedCollections.push(col);
  }

  removeCollection(index) {
    this.selectedCollections.splice(index, 1);
  }

  addVocabulary(voc) {
    if (!this.selectedVocabularies.includes(voc)) {
      this.selectedVocabularies.push(voc);
      this.vocabulariesIndexing[voc] = false;
    }
  }

  removeVocabulary(voc) {
    const index = this.selectedVocabularies.indexOf(voc);
    if (index > -1) {
      this.selectedVocabularies.splice(index, 1);
      delete this.vocabulariesIndexing[voc];
      this.tagGroups.forEach(tGroup => {
        delete tGroup[voc];
      });

    }
  }

  createNewTagGroup() {
    let mapping = Object.assign({}, this.vocabulariesIndexing);
    this.tagGroups.push(mapping);
  }

  deleteTagGroup(index) {
    this.tagGroups.splice(index, 1);
  }

  loadFromFile(id) {
    if (id === "#annotationsFile" && this.annotationsUpload.FILE.file) return;

    $(id).trigger('click');
  }

  uploadBanner = () => {
    let input = document.getElementById('bannerFile');
    let data = new FormData();
    data.append('file', input.files[0]);

    this.mediaServices.upload(data).then((response) => {
      this.campaign.banner = this.displayImage(response.original);
    }).catch((error) => {
      logger.error(error);
      toastr.danger('Error uploading the file!');
    });
  }

  removeBanner() {
    this.campaign.banner = this.DEFAULT_BANNER;
  }

  uploadLogo = () => {
    let input = document.getElementById('logoFile');
    let data = new FormData();
    data.append('file', input.files[0]);

    this.mediaServices.upload(data).then((response) => {
      this.campaign.logo = this.displayImage(response.original);
    }).catch((error) => {
      logger.error(error);
      toastr.danger('Error uploading the file!');
    });
  }

  removeLogo() {
    this.campaign.logo = null;
  }

  toggleLangMenu() {
    if ($('.lang-collection').hasClass('open')) {
      $('.lang-collection').removeClass('open');
    }
    else {
      $('.lang-collection').addClass('open');
    }
  }

  changeLang(index) {
    this.currentLocale = this.locales[index];
  }

  goBackToDashboard() {
    this.router.navigateToRoute('dashboard', {lang: this.loc, resource: 'campaigns'});
  }

  previewCampaign() {
    window.open(this.router.generate('summary', {lang: this.loc, cname: this.cname}));
  }

  prefixChanged(newValue, oldValue) {
		if (newValue === '') {
			this.suggestedNames = [];
			return;
		}
		this.getSuggestedNames(newValue);
		$('#usersuggestions').show();
	}
  groupPrefixChanged(newValue, oldValue) {
		if (newValue === '') {
			this.suggestedGroupNames = [];
			return;
		}
		this.getSuggestedGroupNames(newValue);
		$('#groupsuggestions').show();
	}
  colPrefixChanged(newValue, oldValue) {
		if (newValue === '') {
			this.suggestedColNames = [];
			return;
		}
		this.getSuggestedColNames(newValue);
		$('#collectionsuggestions').show();
	}

  domouseover(index) {
		$('#' + index).addClass('autocomplete-selected');
	}
	domouseout(index) {
		$('#' + index).removeClass('autocomplete-selected');
	}
  hideSuggestions(type) {
    if (type === 'user') {
      this.prefix = '';
      $('#usersuggestions').hide();
      $('#uinput').val('');
    }
    if (type === 'group') {
      this.gprefix = '';
  		$('#groupsuggestions').hide();
  		$('#ginput').val('');
    }
    if (type === 'col') {
      this.gprefix = '';
  		$('#collectionsuggestions').hide();
  		$('#cinput').val('');
    }
	}

  getSuggestedNames(prefix) {
		this.suggestedNames = [];
		this.userServices.listUserNames(prefix)
      .then(res => {
  			this.suggestedNames = res.slice(0, 8);
  		});
	}
  getSuggestedGroupNames(gprefix) {
		this.suggestedGroupNames = [];
		this.groupServices.listGroupNames(gprefix)
      .then(res => {
  			this.suggestedGroupNames = res.slice(0, 8);
  		});
	}
  getSuggestedColNames(cprefix) {
    this.suggestedColNames = [];
    this.collectionServices.getCollectionsGeneric({term: cprefix})
      .then(res => {
        this.suggestedColNames = res.results[0].items.map(col => new Object({id: col.dbId, name: col.descriptiveData.label.default[0]}));
      })
  }

  addMember(index, type) {
    let name = (type === 'user') ? this.suggestedNames[index].username : this.suggestedGroupNames[index].value;
    this.hideSuggestions(type);

    this.groupServices.findByGroupNameOrEmail(name)
      .then(response => {
        if (type === 'user') {
          this.moderators.push(new Object({id: response.userId, name: response.username}));
        }
        if (type === 'group') {
          this.userGroups.push(new Object({id: response.userId, name: response.username}));
        }
      })
      .catch(error => console.error(error));
  }

  removeMember(id) {
    const index = this.moderators.map(mod => mod.id).indexOf(id);
    if (index > -1) {
      this.moderators.splice(index, 1);
    }
  }
  removeGroup(id) {
    const index = this.userGroups.map(group => group.id).indexOf(id);
    if (index > -1) {
      this.userGroups.splice(index, 1);
    }
  }

  uploadFile = () => {
    let self = this;
    let input = document.getElementById('annotationsFile');
    let file = input.files[0];
    this.annotationsUpload.FILE.fileName = file.name;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const fileContent = e.target.result;
        self.annotationsUpload.FILE.file = JSON.parse(fileContent);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);
  }

  uploadAnnotations(source) {
    if (this.annotationsUpload[source].motivation === "") {
      toastr.error(this.i18n.tr("dashboard:error-no-motivation"));
      return;
    }

    if (source === "FILE") {
      if (!this.annotationsUpload[source].file) {
        toastr.error(this.i18n.tr("dashboard:error-no-file"));
        return;
      }
      this.campaignServices.importNtuaAnnotations(this.campaign.username, this.annotationsUpload.FILE.motivation, this.annotationsUpload.FILE.file)
        .then(response => {
          console.log(response);
          this.annotationsUpload.FILE.status = "STARTED";
        })
        .catch(error => {
          console.error(error);
          this.annotationsUpload.FILE.status = "FAILED";
        });
      return;
    }

    if (source === "MINT") {
      if (!this.annotationsUpload[source].url) {
        toastr.error(this.i18n.tr("dashboard:error-no-url"));
        return;
      }
      this.campaignServices.importMintAnnotations(this.campaign.username, this.annotationsUpload.MINT.motivation, this.annotationsUpload.MINT.url)
        .then(response => {
          console.log(response);
          this.annotationsUpload.MINT.status = "STARTED";
        })
        .catch(error => {
          console.error(error);
          this.annotationsUpload.MINT.status = "FAILED";
        });
      return;
    }
  }

  deleteCampaign() {
    if (window.confirm(this.i18n.tr('dashboard:deleteCampaignMessage'))) {
      this.campaignServices.deleteCampaign(this.campaign.dbId)
        .then(() => {
          this.goBackToDashboard();
        })
        .catch(error => console.error(error));
    }
  }

  validInput() {
    if (new Date(this.campaign.startDate) >= new Date(this.campaign.endDate)) {
      toastr.error("Campaign duration invalid");
      return false;
    }
    let target = parseInt(this.campaign.target);
    if (!Number.isInteger(target) || target <= 0) {
      toastr.error("Annotation target must be a positive number");
      return false;
    }
    return true;
  }

  updateCampaign() {
    if (!this.validInput()) {
      window.scrollTo(0,0);
      return;
    }

    let vocabulariesMapping = [];
    this.tagGroups.filter(tagGroup => tagGroup.tagType !== '').forEach(tGroup => {
      vocabulariesMapping.push(new Object({
        labelName: tGroup.tagType,
        vocabularies: Object.keys(tGroup).filter(field => tGroup[field] === true)
      }));
    });

    const camp = {
      username: this.campaign.username,
      title: this.campaign.titleObject,
      description: this.campaign.descriptionObject,
      instructions: this.campaign.instructionsObject,
      banner: this.campaign.banner.split(settings.baseUrl)[1],
      logo: this.campaign.logo.split(settings.baseUrl)[1],
      disclaimer: this.campaign.disclaimerObject,
      isPublic: this.campaign.isPublic,
      purpose: this.campaign.purpose,
      orientation: this.campaign.orientation,
      contributorFeedbackMethod: this.campaign.feedbackMethod,
      motivation: Object.keys(this.motivationValues).filter(mot => this.motivationValues[mot]),
      prizes: this.campaign.prizesObject,
      annotationTarget: this.campaign.target,
      vocabularies: this.selectedVocabularies,
      vocabularyMapping: vocabulariesMapping,
      startDate: this.campaign.startDate.replaceAll('-','/'),
      endDate: this.campaign.endDate.replaceAll('-','/'),
      creators: this.moderators.map(mod => mod.id),
      userGroupIds: this.userGroups.map(group => group.id),
      targetCollections: this.selectedCollections.map(col => col.id)
    };

    this.campaignServices.editCampaign(this.campaign.dbId, camp)
      .then(() => {
        window.scrollTo(0,0);
        toastr.success(this.i18n.tr('dashboard:campaignUpdatedSuccess'));
        this.loadCampaign();
      })
      .catch(error => {
        console.error(error);
        toastr.error(this.i18n.tr('dashboard:campaignUpdatedError'));
      });
  }

}
