import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Collection } from 'Collection.js';
import { CollectionServices } from 'CollectionServices.js';
import { UserServices } from 'UserServices';
import { I18N } from 'aurelia-i18n';
//import settings from 'global.config.js';

let instance = null;

@inject(CollectionServices, Router, I18N)
export class ImportEuropeana {

  constructor(collectionServices, router, i18n) {
    if (instance) {
      return instance;
    }
    this.collectionServices = collectionServices;
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
          label: "Collection Name",
          type: "text"
        },
        {
          placeholder: "Europeana Search Term",
          value: "",
          label: "Search Term",
          type: "text"
        },
        {
          placeholder: "The rest of the query for Europeana API",
          value: "",
          label: "Query Tail",
          type: "text"
        },
        {
          placeholder: "Maximum Number of Items",
          value: "",
          label: "Import Limit",
          type: "number"
        },
      ]
    }
    else if (params.importMethod === "Europeana Dataset") {
      this.inputs = [
        {
          placeholder: "Name of your Collection",
          value: "",
          label: "Europeana Collection ID",
          type: "text"
        },
        {
          placeholder: "Maximum Number of Items (-1 for no limit)",
          value: "",
          label: "Import Limit",
          type: "number"
        }
      ]
    }
    this.inputs.forEach((inp) => {
      this[inp.field] = ''
    })
    this.importMethod = params.importMethod
  }

  importCollection(inputs) {
    console.log(inputs);
    if (this.importMethod === "Europeana Dataset") {
      this.collectionServices.importEuropeanaCollection(inputs[0].value, inputs[1].value)
        .then(response => {
          console.log(response)
        })
    }
    else if (this.importMethod === "Europeana Search") {
      // this.validationController.validate().then(v => {
      //   if (v.valid) {
          console.log(this.limit);
          let query = {
            collectionName: this.inputs[0].value,
            limit: ((this.inputs[3].value === undefined || this.inputs[3].value === null) ? -1 : this.inputs[3].value),
            tail: this.inputs[3].value,
            query: {
              searchTerm: this.inputs[1].value,
              page: 1,
              pageSize: 20
            }
          };
          console.log(query)

          this.collectionServices.importEuropeanaSearch(query)
            .then(response => {
              this.afterImport(response);
            }
            ).catch(error => {
              this.saving = false;
              toastr.error(error.message);
            });
      //   } else {
      //     this.errors = this.validationController.errors;
      //   }
      // });

      this.collectionServices.importEuropeanaSearch(inputs[0].value, inputs[1].value)
        .then(response => {
          console.log(response)
        })

    }
    else if (this.importMethod === "Europeana User Gallery") {
      pass;
    }
    // this.collectionServices.
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

		/* change editables and user collections */
		if (this.resourceType === 'collection') {
			this.ea.publish('collection-created', new Collection(response));
			toastr.success('Collection imported successfully!');
		}
		if (this.selected) {
			this.addRecord.call(this, response.dbId);
		} else {
			this.closeTab();
		}
	}

  printState() {
    this.inputs.forEach((inp) => {
      console.log(inp.value)
    })
  }
}
