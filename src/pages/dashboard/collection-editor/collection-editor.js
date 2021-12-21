import { inject, LogManager } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { CampaignServices } from 'CampaignServices.js';
import { Collection } from 'Collection.js';
import { CollectionServices } from 'CollectionServices.js';
import { UserServices } from 'UserServices';
import { I18N } from 'aurelia-i18n';
import settings from 'global.config.js';
let logger = LogManager.getLogger('CollectionEditor.js');

let COUNT = 10;

@inject(CampaignServices, CollectionServices, UserServices, Router, I18N, 'isTesterUser')
export class CollectionEditor {
  constructor(campaignServices, collectionServices, userServices, router, i18n, isTesterUser) {
    this.project = settings.project;
    this.loc = window.location.href.split('/')[3];
    this.campaignServices = campaignServices;
    this.collectionServices = collectionServices;
    this.userServices = userServices;
    this.router = router;
    this.i18n = i18n;
    this.more = true;
    this.isCreator = false;
    this.campaign = 0;
    this.collectionsCount = 0;
    this.collections = [];
    this.loading = false;
    this.count = 12;
    this.offset = 0;
    this.importMethod = ''
  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }
  get user() { return this.userServices.current; }

  activate(params, route) {
    if (this.i18n.getLocale() != this.loc) {
      this.i18n.setLocale(this.loc);
    }
    if (this.user) {
      this.loading = true;
      this.getCollectionsByUser();
    }
  }

  getCollectionsByUser() {
    this.collectionServices.getCollections(this.offset, this.count, true, false, this.user.username).then(response => {
      // console.log(this.user.dbId)
      let collectionIds = response.collectionsOrExhibitions.map(col => {
        return col.dbId
      })
      this.collectionsCount += response.collectionsOrExhibitions.length;
      this.offset += this.count;
      this.collectionServices.getMultipleCollections(collectionIds, 0, this.count,false)
        .then(res => {
          this.more = response.totalCollections > this.collectionsCount
          if (res.length > 0) {
            for (let i in res) {
              this.collections.push(new Collection(res[i]));
            }
          }
          this.loading = false;
        });

    });
  }

  loadMore() {
    this.getCollectionsByUser()
  }

  newCollection() {
    this.edittype = 'new';
    this.editableCollection = null;
    document.getElementById("editSidebar").style.width = "450px";
    document.getElementById("editSidebar").style.boxShadow = "0px 0px 10px 0px rgba(0,0,0,.6)"
  }

  editCollection(collection) {
    this.edittype = 'edit';
    this.editableCollection = collection;
    document.getElementById("editSidebar").style.width = "450px";
    document.getElementById("editSidebar").style.boxShadow = "0px 0px 10px 0px rgba(0,0,0,.6)"
  }

  closeNav() {
    this.selectedAccess = this.edit ? this.collection.isPublic : false;
    this.title = this.edit ? this.collection.title : '';
    this.desc = this.edit ? this.collection.description : '';
    document.getElementById("editSidebar").style.width = "0";
    document.getElementById("editSidebar").style.boxShadow = "none";
  }

  closeAfterSave(title, description, access, locales) {
    // console.log(title, description)
    let emptyTitle = true;
    for (const [key, value] of Object.entries(title)) {
      if (key === "default") continue;
      if(value !== ""){
        emptyTitle = false;
        break
      }
    }
      if (emptyTitle) {
      toastr.error('The collection title is required.');
      return;
    }
    let titleObject = { default: title['en'] ? [title['en']] : [""] }
    let descriptionObject = { default: description['en'] ? [description['en']] : [""] }

    for (let loc of locales) {
      titleObject[loc.code] = title[loc.code] ? [title[loc.code]] : [""]
      descriptionObject[loc.code] = description[loc.code] ? [description[loc.code]] : [""]
    }
    // console.log(titleObject)
    if (this.edittype === 'new') {
      let collectiontosave = {
        resourceType: 'SimpleCollection',
        administrative: {
          access: {
            isPublic: access
          }
        },
        descriptiveData: {
          label: titleObject,
          description: descriptionObject
        }
      };
      this.collectionServices.save(collectiontosave)
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

          /* change editables and user collections */
          toastr.success('Collection saved successfully!');
          document.getElementById("editSidebar").style.width = "0";
          document.getElementById("editSidebar").style.boxShadow = "none"
          this.collections = [];
          this.collectionsCount = 0;
          this.offset = 0;
          this.getCollectionsByUser();
        }).catch(error => {
          toastr.error(error.message);
        });
    }
    else if (this.edittype === 'edit') {
      let collectiontosave = {
        resourceType: 'SimpleCollection',
        administrative: {
          access: {
            isPublic: access
          }
        },
        descriptiveData: {
          label: titleObject,
          description: descriptionObject
        }
      };
      // console.log(collectiontosave)
      this.collectionServices.update(this.editableCollection.dbId, collectiontosave)
        .then(response => {
          if (response.status !== 200) {
            if (response.statusText) {
              throw new Error(response.statusText);
            } else if (response.error) {
              throw new Error(response.error);
            }
          }
          toastr.success('Collection updated');
          document.getElementById("editSidebar").style.width = "0";
          document.getElementById("editSidebar").style.boxShadow = "none"
          this.collections = [];
          this.collectionsCount = 0;
          this.offset = 0;
          this.getCollectionsByUser();
        })
        .catch(error => {
          this.closeTab();
          toastr.error(error.message);
        });
    }
  }

  deleteCollection(collection) {
    if (window.confirm("Do you really want to delete this collection?")) {
      this.collectionServices.delete(collection.dbId).then(response => {
        this.collections = [];
        this.collectionsCount = 0;
        this.offset = 0;
        this.getCollectionsByUser();
      })
    }
  }
}
