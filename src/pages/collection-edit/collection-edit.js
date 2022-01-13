import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Collection } from 'Collection.js';
import { CollectionServices } from 'CollectionServices.js';
import { UserServices } from 'UserServices';
import { I18N } from 'aurelia-i18n';

let instance = null;

@inject(CollectionServices, UserServices, Router, I18N)
export class CollectionEdit {

  constructor(collectionServices, userServices, router, i18n) {
    if (instance) {
      return instance;
    }
    this.collectionServices = collectionServices;
    this.userServices = userServices;
    this.router = router;
    this.i18n = i18n;
    this.importMethod = '';
    this.collectionId = '';

    this.loc;
    if (!instance) {
      instance = this;
    }
  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }
  get user() { return this.userServices.current }

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
    document.getElementById("mySidebar").style.width = "450px";
    document.getElementById("mySidebar").style.boxShadow = "0px 10px 10px 0px rgba(0,0,0,.6)";
    this.importMethod = method;
  }

  closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("mySidebar").style.boxShadow = "none";
    this.importMethod = '';
  }

  async activate(params, route) {
    this.loc = params.lang;
    this.i18n.setLocale(params.lang);

    this.cname = params.cname;
    this.collectionId = params.colid;
    let collectionData = await this.collectionServices.getCollection(this.collectionId, false);
    this.collection = new Collection(collectionData);

    let title = this.collection.title[this.loc] && this.collection.title[this.loc][0] !== 0 ? this.collection.title[this.loc][0] : this.collection.title.default[0];
    route.navModel.setTitle('Curate | ' + title);
  }

  importToCollection(inputs) {
    if (this.importMethod === "europeanaDataset") {
      this.collectionServices.importEuropeanaCollection(inputs[0].value, inputs[1].value, this.collection.title.default[0])
        .then(response => {
          this.collectionServices.getCollection(this.collectionId, false).then(res => {
            this.collection = new Collection(res);
          });
          this.closeNav();
        })
    }
    else if (this.importMethod === "europeanaSearch") {
      // this.validationController.validate().then(v => {
      //   if (v.valid) {
      // console.log(this.limit);
      let query = {
        collectionName: this.collection.title.default[0],
        limit: ((inputs[1].value === undefined || inputs[1].value === null) ? -1 : parseInt(inputs[1].value)),
        query: {
          searchTerm: inputs[0].value,
          page: 1,
          pageSize: 20
        }
      };
      this.collectionServices.importEuropeanaSearch(query)
        .then(response => {
          this.afterImport(response);
        }
        ).catch(error => {
          this.saving = false;
          toastr.error(error.message);
        });

    }
    else if (this.importMethod === "europeanaGallery") {
      this.collectionServices.importEuropeanaGallery(inputs[0].value, this.collection.title.default[0])
        .then(response => {
          this.afterImport(response);
        })
        .catch(error => {
          this.saving = false;
          toastr.error(error.message);
        });
    }
    else if (this.importMethod === "europeanaItems") {
      let body = {
        itemIds: inputs[0].value.trim().split('\n').filter(url => url.length>0).map(url => '/'+url.split('/item/')[1]),
        collectionName: this.collection.title.default[0]
      }
      this.collectionServices.importEuropeanaItems(body)
        .then(response => {
          this.afterImport(response);
        })
        .catch(error => {
          this.saving = false;
          toastr.error(error.message);
        });
    }
  }

  afterImport(response) {
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

    this.collectionServices.getCollection(this.collectionId, false).then(res => {
      this.collection = new Collection(res);
      toastr.success('Collection imported successfully!');
    });

    this.closeNav();
  }

}
