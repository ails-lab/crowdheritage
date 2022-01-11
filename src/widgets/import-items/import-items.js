import { inject } from 'aurelia-framework';
import { CollectionServices } from 'CollectionServices.js';
import { I18N } from 'aurelia-i18n';

let instance = null;

@inject(CollectionServices, I18N)
export class ImportItems {

  constructor(collectionServices, i18n) {
    if (instance) {
      return instance;
    }
    this.collectionServices = collectionServices;
    this.i18n = i18n;
    this.sidebarTitle = '';
    this.importMethod = '';
    this.inputs = [];
    if (!instance) {
      instance = this;
    }
    this.inputs = [];
  }

  attached() {
  }

  async activate(params, route) {
    this.importMethod = params.importMethod;
    this.sidebarTitle = `${this.i18n.tr('dashboard:import')} ${this.i18n.tr('dashboard:'+this.importMethod)}`;

    this.inputs = [];
    if (params.importMethod === "europeanaSearch") {
      this.inputs = [
        {
          textarea: false,
          type: "text",
          value: "",
          label: this.i18n.tr('dashboard:europeanaSearchLabel'),
          placeholder: this.i18n.tr('dashboard:europeanaSearchPlaceholder')
        },
        {
          textarea: false,
          type: "number",
          value: "",
          label: this.i18n.tr('dashboard:europeanaImportLimitLabel'),
          placeholder: this.i18n.tr('dashboard:europeanaImportLimitPlaceholder')
        },
      ]
    }
    else if (params.importMethod === "europeanaDataset") {
      this.inputs = [
        {
          textarea: false,
          type: "text",
          value: "",
          label: this.i18n.tr('dashboard:europeanaDatasetLabel'),
          placeholder: this.i18n.tr('dashboard:europeanaDatasetPlaceholder')
        },
        {
          textarea: false,
          type: "number",
          value: "",
          label: this.i18n.tr('dashboard:europeanaImportLimitLabel'),
          placeholder: this.i18n.tr('dashboard:europeanaImportLimitPlaceholder')
        }
      ]
    }
    else if (params.importMethod === "europeanaGallery") {
      this.inputs = [
        {
          textarea: false,
          type: "text",
          value: "",
          label: this.i18n.tr('dashboard:europeanaGalleryLabel'),
          placeholder: this.i18n.tr('dashboard:europeanaGalleryPlaceholder')
        }
      ]
    }
    else if (params.importMethod === "europeanaItems") {
      this.inputs = [
        {
          textarea: true,
          value: "",
          label: this.i18n.tr('dashboard:europeanaItemsLabel'),
          placeholder: this.i18n.tr('dashboard:europeanaItemsPlaceholder')
        }
      ]
    }

    this.inputs.forEach((inp) => {
      this[inp.field] = '';
    })
  }
}
