import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Collection } from 'Collection.js';
import { CollectionServices } from 'CollectionServices.js';
import { UserServices } from 'UserServices';
import { I18N } from 'aurelia-i18n';
//import settings from 'global.config.js';

let instance = null;

@inject(Router, I18N)
export class ImportEuropeana {

  constructor(router, i18n) {
    if (instance) {
      return instance;
    }
    this.router = router;
    this.i18n = i18n;
    this.importMethod = '';
    this.inputs = [];
    this.loc;
    if (!instance) {
      instance = this;
    }
    this.inputs = [];
  }

  // get isAuthenticated() { return this.userServices.isAuthenticated(); }
  // get user() { return this.userServices.current; }

  attached() {
  }

  async activate(params, route) {
    this.inputs = []
    if (params.importMethod === "Europeana Search") {
      this.inputs = [
        {
          placeholder: "Name of your Collection",
          value: "",
          label: "Collection Name"
        },
        {
          placeholder: "Europeana Search Term",
          value: "",
          label: "Search Term"
        },
        {
          placeholder: "The rest of the query for Europeana API",
          value: "",
          label: "Query Tail"
        },
        {
          placeholder: "Maximum Number of Items",
          value: "",
          label: "Import Limit"
        },
      ]
    }
    else if (params.importMethod === "Europeana Dataset") {
      this.inputs = [
        {
          placeholder: "Name of your Collection",
          value: "",
          label: "Europeana Collection ID"
        },
        {
          placeholder: "Maximum Number of Items (-1 for no limit)",
          value: "",
          label: "Import Limit"
        }
      ]
    }
    this.inputs.forEach((inp) => {
      this[inp.field] = ''
    })
    this.importMethod = params.importMethod
  }

  printState(){
    this.inputs.forEach((inp) => {
      console.log(inp.value)
    })
  }
}
