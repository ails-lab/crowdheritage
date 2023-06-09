import { inject } from 'aurelia-framework';
import { CollectionServices } from 'CollectionServices.js';
import { I18N } from 'aurelia-i18n';
import { UserServices } from '../../modules/UserServices';

let instance = null;

@inject(CollectionServices, UserServices, I18N)
export class ShareCollection {

  constructor(collectionServices, userServices, i18n) {
    if (instance) {
      return instance;
    }
    this.collectionServices = collectionServices;
    this.userServices = userServices;
    this.i18n = i18n;
    this.loc = window.location.href.split('/')[3];
    this.suggestedNames = [];
    this.users = [];
  }

  get suggestionsActive() { return this.suggestedNames.length !== 0; }
  get user() { return this.userServices.current; }

  async activate(params, route) {
    this.collection = params.collection;
    if (!this.collection) return;
    this.getUsersWithAccess();
  }

  getUsersWithAccess() {
    this.collectionServices.getUsersAccess(this.collection.dbId).then(response => {
      this.users = response;
    })
  }

  prefixChanged(newValue, oldValue) {
    if (newValue === '') {
      this.suggestedNames = [];
      return;
    }
    this.getSuggestedNames(newValue);
    $('#usersuggestions').show();
  }

  getSuggestedNames(prefix) {
    this.suggestedNames = [];
    this.userServices.listUserNames(prefix).then((res) => {
      this.suggestedNames = res.slice(0, 8);
    });
  }

  domouseover(index) {
    $('#' + index).addClass('autocomplete-selected');
  }

  domouseout(index) {
    $('#' + index).removeClass('autocomplete-selected');
  }

  hideuSuggestions() {
    this.prefix = '';
    $('#usersuggestions').hide();
    $('#uinput').val('');
  }

  userIsNotMe(user) {
    return user.userId != this.user.dbId
  }

  giveAccess(idx) {
    let username = this.suggestedNames[idx].value;
    this.collectionServices.shareCollection(this.collection.dbId, username, 'WRITE').then(response => {
      this.getUsersWithAccess();
      this.hideuSuggestions();
    })
  }

  removeAccess(username, id, category) {
    this.collectionServices.shareCollection(this.collection.dbId, username, 'NONE').then(response => {
      this.getUsersWithAccess();
    })
  }
}
