import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Collection } from 'Collection.js';
import { CollectionServices } from 'CollectionServices.js';
import { UserServices } from 'UserServices';
import { I18N } from 'aurelia-i18n';
//import settings from 'global.config.js';

let instance = null;

@inject(CollectionServices, Router, I18N)
export class Newcollection {

  constructor(collectionServices, router, i18n) {
    if (instance) {
      return instance;
    }
    this.collectionServices = collectionServices;
    this.router = router;
    this.i18n = i18n;
    this.importMethod = '';
    this.loc;
    this.resourceType = 'collection';
    if (!instance) {
      instance = this;
    }
    this.access = [
      {
        value: 'Private',
        bool: false
      },
      {
        value: 'Public',
        bool: true
      }
    ];
    this.selectedAccess = false;
    this.collection = new Collection();
  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }
  get user() { return this.userServices.current; }

  attached() {
  }

  async activate(params, route) {
    // console.log(params)
    this.edit = params.type === 'edit' ? true : false;
    if (params.collection) {
      this.collection = params.collection
      console.log(this.collection)
      this.selectedAccess = this.collection.isPublic;
      this.title = this.collection.title
      this.desc = this.collection.description
    }
    else {
      this.collection = new Collection()
      this.collection.isPublic = false
      this.selectedAccess = false
      this.title = '';
      this.desc = ''
    }
  }

  saveCollections() {
    if (!this.edit) {
      this.save()
    }
    else{
      this.update()
    }
  }

  closeNav(){
    this.selectedAccess = this.edit ? this.collection.isPublic : false;
    this.title = this.edit ? this.collection.title : '';
    this.desc = this.edit ? this.collection.description: '';
    document.getElementById("editSidebar").style.width = "0";
    document.getElementById("editSidebar").style.boxShadow = "none"

  }
  update(){
    this.saving = true;
    let collectiontosave = {
      resourceType: 'SimpleCollection',
      administrative: {
        access: {
          isPublic: this.selectedAccess
        }
      },
      descriptiveData: {
        label: {
          default: [this.title]
        },
        description: {
          default: [this.desc]
        }
      }
    };
    this.collectionServices.update(this.collection.dbId, collectiontosave)
      .then(response => {
        if(response.status !== 200) {
          if (response.statusText) {
            throw new Error(response.statusText);
          } else if (response.error) {
            throw new Error(response.error);
          }
        }
        // this.ea.publish('collection-updated', this.collection);
        // if (typeof this.parent.collection !== 'undefined') {
        //   this.parent.collection.title = this.collection.title;
        //   this.parent.collection.description = this.collection.description;
        //   this.parent.collection.isPublic = this.collection.isPublic;
        // }
        this.saving = false;
        toastr.success('Collection updated');
      })
      .catch(error => {
        this.saving = false;
        this.closeTab();
        toastr.error(error.message);
      });

  }

  save() {

    this.saving = true;
    let collectiontosave = {
      resourceType: this.resourceType === 'collection' ? 'SimpleCollection' : 'Exhibition',
      administrative: {
        access: {
          isPublic: this.selectedAccess
        }
      },
      descriptiveData: {
        label: {
          default: [this.title]
        },
        description: {
          default: [this.desc]
        }
      }
    };

    this.collectionServices.save(collectiontosave)
      .then(response => {
        this.saving = false;
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
        if (this.resourceType === 'collection') {
          // this.ea.publish('collection-created', new Collection(response));
          toastr.success('Collection saved successfully!');
        } else {
          this.ea.publish('exhibition-created', new Collection(response));
          toastr.success('Exhibition saved successfully!');
          this.router.navigate('/my/exhibition/' + response.dbId + '/edit');
        }
        // if (this.selected) {
        //   this.addRecord.call(this, response.dbId);
        // } else {
        //   this.closeTab();
        // }
      }).catch(error => {
        this.saving = false;
        toastr.error(error.message);
      });
  }
}
