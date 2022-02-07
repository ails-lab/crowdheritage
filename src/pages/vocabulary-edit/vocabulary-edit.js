import { inject } from 'aurelia-framework';
import { UserServices } from 'UserServices';
import { ThesaurusServices } from 'ThesaurusServices';
import { Router } from 'aurelia-router';
import { I18N } from 'aurelia-i18n';

let instance = null;

@inject(UserServices, ThesaurusServices, Router, I18N)
export class VocabularyEdit {

  constructor(userServices, thesaurusServices, router, i18n) {
    if (instance) {
      return instance;
    }
    this.userServices = userServices;
    this.thesaurusServices = thesaurusServices;
    this.router = router;
    this.i18n = i18n;
    this.loc;

    this.shortName = '';
    this.vocabulary = {};
    this.terms = [];
    this.newTerms = '';
    if (!instance) {
      instance = this;
    }
  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }
  get user() { return this.userServices.current; }

  toggleImportMenu() {
    if ($('.import-wrap').hasClass('open')) {
      $('.import-wrap').removeClass('open');
    }
    else {
      $('.import-wrap').addClass('open');
    }
  }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  openImportSidebar(method) {
    document.getElementById("editSidebar").style.width = "450px";
    document.getElementById("editSidebar").style.boxShadow = "0px 10px 10px 0px rgba(0,0,0,.6)";
  }

  closeNav() {
    document.getElementById("editSidebar").style.width = "0";
    document.getElementById("editSidebar").style.boxShadow = "none";
    this.newTerms = '';
  }

  async activate(params, route) {
    // Check if user is logged in and has elevated access
    if (!this.userServices.isAuthenticated() || !this.userServices.current.isEditor) {
      this.router.navigateToRoute('index', {lang: this.locale});
    }

    this.loc = params.lang;
    this.shortName = params.vname;
    this.i18n.setLocale(params.lang);

    this.vocabulary = {};
    this.thesaurusServices.getThesaurusAdmin(this.shortName)
      .then(response => {
        this.vocabulary = response;
        route.navModel.setTitle('Curate | ' + this.vocabulary.label);
      })
      .catch(error => console.error(error));

    this.loadTerms();
  }

  loadTerms() {
    this.loading = true;
    this.terms = [];
    this.thesaurusServices.listTerms(this.shortName)
      .then(response => {
        this.terms = response;
        function compareName(a, b) {
          if ( a.semantic.prefLabel['en'].toLowerCase() < b.semantic.prefLabel['en'].toLowerCase() ){
            return -1;
          }
          if ( a.semantic.prefLabel['en'].toLowerCase() > b.semantic.prefLabel['en'].toLowerCase() ){
            return 1;
          }
          return 0;
        }
        this.terms.sort(compareName);
        this.loading = false;
      })
      .catch(error => console.error(error));
  }

  loadFromFile() {
		$('#csvUpload').trigger('click');
	}
  // This weird syntax is necessary to be able to access *this*
	uploadFile = () => {
    this.loading = true;
    document.body.style.cursor = 'wait';
		let input = document.getElementById('csvUpload');
		let data = new FormData();
		data.append('file', input.files[0]);
    this.thesaurusServices.populateThesaurus(this.vocabulary.name, this.vocabulary.version, data)
      .then(() => {
        document.body.style.cursor = 'default';
        toastr.success("CSV with terms imported successfully");
        this.loadTerms();
      })
      .catch(error => {
        console.error(error);
        document.body.style.cursor = 'default';
      });
	}

  deleteAllTerms() {
    if (window.confirm(this.i18n.tr('dashboard:deleteVocabularyTermsMessage'))) {
      this.thesaurusServices.deleteAllThesaurusTerms(this.vocabulary.dbId)
        .then(response => {
          toastr.success(response.message);
          this.loadTerms();
        })
        .catch(error => toastr.error(error.error));
    }
  }

  deleteTerm(id) {
    if (window.confirm(this.i18n.tr('dashboard:deleteVocabularyTermMessage'))) {
      this.thesaurusServices.deleteTerm(id)
        .then(response => {
          toastr.success(response.message);
          this.loadTerms();
        })
        .catch(error => toastr.error(error.error));
    }
  }

  addTerms() {
    this.loading = true;
    document.body.style.cursor = 'wait';
    let body = {
      thesaurusName: this.vocabulary.name,
      thesaurusVersion: this.vocabulary.version,
      uris: this.newTerms.trim().split('\n').filter(url => url.trim().length>0)
    };
    this.closeNav();
    this.thesaurusServices.addTerms(body)
      .then(response => {
        toastr.success(response.message);
        this.loadTerms();
        document.body.style.cursor = 'default';
      })
      .catch(error => {
        toastr.error(error.error);
        document.body.style.cursor = 'default';
      })
  }

  downloadTerms() {
    var csv_header = "URI,Label\n";
    var csv_body = this.terms.map(term => `${term.semantic.uri},${term.semantic.prefLabel.en}`).join("\n");
    var csv = csv_header.concat(csv_body);

    var dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", this.shortName+'.csv');
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    this.closeNav();
  }

}
