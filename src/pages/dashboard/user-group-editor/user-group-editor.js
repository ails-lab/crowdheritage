import { inject, LogManager, NewInstance } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { CampaignServices } from 'CampaignServices.js';
import { UserServices } from 'UserServices';
import { I18N } from 'aurelia-i18n';
import settings from 'global.config.js';
import { GroupServices } from '../../../modules/GroupServices';
let logger = LogManager.getLogger('UserGroupEditor.js');

let COUNT = 12;

@inject(CampaignServices, GroupServices, UserServices, Router, I18N)
export class UserGroupEditor {
  constructor(campaignServices, groupServices, userServices, router, i18n) {
    this.project = settings.project;
    this.loc = window.location.href.split('/')[3];
    this.groupServices = groupServices;
    this.userServices = userServices;
    this.router = router;
    this.i18n = i18n;
    this.more = true;
    this.isCreator = false;
    this.loading = false;
    this.userGroups = [];
    this.userGroupsCount = 0;
    this.offset = 0;
    this.delete = false;
  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }
  get user() { return this.userServices.current; }
  get totalGroupsCount() { return this.userServices.current.count.myGroups; }

  activate(params, route) {
    if (this.i18n.getLocale() != this.locale) {
      this.i18n.setLocale(this.locale);
    }
    if (this.user) {
      this.getUserGroups(this.offset, COUNT);
    }
  }

  loadMore() {
    this.getUserGroups(this.offset, COUNT);
  }

  getUserGroups(off, cnt) {
    this.loading = true;
    this.groupServices.getGroups(off, cnt, '*').then(response => {
      this.userGroupsCount = response.groupCount;
      if (response.groups.length === cnt) {
        this.offset = off + cnt;
      }
      else {
        this.offset = off + cnt;
        this.more = false;
      }
      response.groups.map(ug => {
        this.userGroups.push(ug)
      })
      // Reload current user in order to update totalGroupsCount
      this.userServices.reloadCurrentUser();
      this.loading = false;
    })
  }

  deleteUserGroup(id) {
    this.delete = true;
    let message = this.i18n.tr('dashboard:deleteUserGroupMessage');
    if (window.confirm(message)) {
      this.groupServices.delete(id).then(response => {
        console.log(response)
        this.userGroups = [];
        this.userGroupsCount = 0;
        this.offset = 0;
        this.getUserGroups(this.offset, COUNT);
        this.closeNav()
        this.delete = false;
      })
    }
    this.closeNav()
  }

  newUserGroup() {
    document.getElementById("newUserGroupSidebar").style.width = "450px";
    document.getElementById("newUserGroupSidebar").style.boxShadow = "0px 0px 10px 0px rgba(0,0,0,.6)"
    this.edittype = 'new';
    this.editableUserGroup = null;
  }

  editUserGroup(userGroup) {
    if (!this.delete) {
      document.getElementById("newUserGroupSidebar").style.width = "500px";
      document.getElementById("newUserGroupSidebar").style.boxShadow = "0px 0px 10px 0px rgba(0,0,0,.6)"
      this.edittype = 'edit';
      this.editableUserGroup = userGroup;
    }
    this.delete = false;
  }

  closeNav() {
    this.name = this.edit ? this.userGroup.friendlyName : '';
    this.shortName = this.edit ? this.userGroup.username : '';
    this.about = this.edit ? this.userGroup.about : '';
    document.getElementById("newUserGroupSidebar").style.width = "0";
    document.getElementById("newUserGroupSidebar").style.boxShadow = "none"
  }

  closeNavAfterSave(name, shortName, about) {
    let toastSentence = '';

    if (name === '') {
      toastSentence += 'Name is '
    }
    if (shortName === ''){
      if (name==='') toastSentence = 'Name and Short Name are '
      else toastSentence += 'Short Name is '
    }
    if (toastSentence !== ''){
      toastr.error(toastSentence + 'required')
      return;
    }

    if (this.edittype === "edit") {
      let userGroup = {
        friendlyName: name,
        username: shortName,
        about: about,
        page: this.editableUserGroup.page,
        privateGroup: this.editableUserGroup.privateGroup
      }
      this.groupServices.update(this.editableUserGroup.dbId, userGroup)
        .then(response => {
          if (response.status !== 200) {
            if (response.statusText) {
              throw new Error(response.statusText);
            } else if (response.error) {
              throw new Error(response.error);
            }
          }
          if (!this.userServices.current) {
            toastr.error('An error has occurred. You are no longer logged in!');
            return;
          }
          toastr.success('Group details updated!');
          this.userGroups = [];
          this.userGroupsCount = 0;
          this.offset = 0;
          this.closeNav();
          this.getUserGroups(this.offset, COUNT);
        })
    }
    else if (this.edittype === 'new') {
      let userGroup = {
        friendlyName: name,
        username: shortName,
        about: about,
        page: { address: null, city: null, country: "", url: null },
        privateGroup: true
      }
      this.groupServices.newGroup(userGroup, { value: 'organization' })
        .then(response => {
          if (response.status !== 200) {
            if (response.statusText) {
              throw new Error(response.statusText);
            } else if (response.error) {
              throw new Error(response.error);
            }
          }
          if (!this.userServices.current) {
            toastr.error('An error has occurred. You are no longer logged in!');
            return;
          }
          toastr.success('Group created!');
          this.userGroups = [];
          this.userGroupsCount = 0;
          this.offset = 0;
          this.closeNav();
          this.getUserGroups(this.offset, COUNT);
        });
    }
  }
}
