import { inject, LogManager, NewInstance } from 'aurelia-framework';
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { Router } from 'aurelia-router';
import { Campaign } from 'Campaign.js';
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
    // this.recordServices = recordServices;
    this.router = router;
    this.i18n = i18n;
    // this.isTesterUser = isTesterUser();
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
    if (this.i18n.getLocale() != this.locale) {
      this.i18n.setLocale(this.locale);
    }
    if (this.user) {
      this.loading = true;
      this.getCollectionsByUser();
      this.loading = false;
    }

  }

  getCollectionsByUser() {
    this.collectionServices.getCollections(this.offset, this.count, true, false, this.user.username).then(response => {
      let collectionIds = response.collectionsOrExhibitions.map(col => {
        return col.dbId
      })
      this.collectionsCount += response.collectionsOrExhibitions.length;
      this.offset += this.count;
      this.collectionServices.getMultipleCollections(collectionIds, 0, this.count)
        .then(res => {
          this.more = response.totalCollections > this.collectionsCount
          if (res.length > 0) {
            for (let i in res) {
              this.collections.push(new Collection(res[i]));
            }
          }
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

  closeAfterSave(title, description, access) {
    if (this.edittype === 'new') {
      let collectiontosave = {
        resourceType: 'SimpleCollection',
        administrative: {
          access: {
            isPublic: access
          }
        },
        descriptiveData: {
          label: {
            default: [title]
          },
          description: {
            default: [description]
          }
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
          label: {
            default: [title]
          },
          description: {
            default: [description]
          }
        }
      };
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
