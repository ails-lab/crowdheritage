import { inject, LogManager } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { ThesaurusServices } from '../../../modules/ThesaurusServices';
import { UserServices } from 'UserServices';
import { I18N } from 'aurelia-i18n';
import settings from 'global.config.js';
let logger = LogManager.getLogger('VocabularyEditor.js');

@inject(ThesaurusServices, UserServices, Router, I18N)
export class VocabularyEditor {
  constructor(thesaurusServices, userServices, router, i18n) {
    this.project = settings.project;
    this.loc = window.location.href.split('/')[3];
    this.thesaurusServices = thesaurusServices;
    this.userServices = userServices;
    this.router = router;
    this.i18n = i18n;

    this.loading = false;
    this.vocabularies = [];
    this.shortName = '';
    this.title = '';
    this.version = '';
  }

  get user() { return this.userServices.current; }
  get vocabulariesCount() { return this.vocabularies.length; }

  activate(params, route) {
    if (this.i18n.getLocale() != this.loc) {
      this.i18n.setLocale(this.loc);
    }

    this.getUserVocabularies();
  }

  getUserVocabularies() {
    this.loading = true;
    this.vocabularies.splice(0, this.vocabularies.length);
    this.thesaurusServices.listVocabularies()
      .then(response => {
        response.forEach(voc => {
          if (this.hasEditAccess(voc)) {
            this.vocabularies.push(voc);
          }
        });
        this.loading = false;
        this.sortVocabularies();

      })
      .catch(error => console.error(error));
  }

  sortVocabularies() {
    function compareName(a, b) {
      if ( a.name.toLowerCase() < b.name.toLowerCase() ){
        return -1;
      }
      if ( a.name.toLowerCase() > b.name.toLowerCase() ){
        return 1;
      }
      return 0;
    }

    this.vocabularies.sort(compareName);
  }

  hasEditAccess(vocabulary) {
    let hasAccess = false;
    vocabulary.access.acl.forEach(acl => {
      if ((acl.user === this.user.dbId) && (acl.level === 'OWN' || acl.level === 'WRITE')) {
        hasAccess = true;
      }
    });
    return hasAccess;
  }

  newVocabulary() {
    document.getElementById("editSidebar").style.width = "450px";
    document.getElementById("editSidebar").style.boxShadow = "0px 0px 10px 0px rgba(0,0,0,.6)"
  }

  createVocabulary() {
    this.thesaurusServices.createEmptyThesaurus(this.shortName, this.version, this.title)
      .then(response => {
        toastr.success(this.i18n.tr('dashboard:vocabularySuccessMessage'));
        this.getUserVocabularies();
        this.closeNav();
      })
      .catch(error => toastr.error(this.i18n.tr('dashboard:vocabularyErrorMessage')));
  }

  deleteVocabulary(id) {
    if (window.confirm(this.i18n.tr('dashboard:deleteVocabularyMessage'))) {
      this.thesaurusServices.deleteThesaurus(id)
        .then(response => {
          toastr.success("Vocabulary deleted successfully");
          this.getUserVocabularies();
        })
        .catch(error => toastr.error("Vocabulary deletion failed"));
    }
  }

  curateVocabulary(voc) {
    this.router.navigateToRoute('vocabulary-edit', {lang: this.loc, vname: voc.name});
  }

  closeNav() {
    this.shortName = '';
    this.title = '';
    this.version = '';
    document.getElementById("editSidebar").style.width = "0";
    document.getElementById("editSidebar").style.boxShadow = "none"
  }

}
