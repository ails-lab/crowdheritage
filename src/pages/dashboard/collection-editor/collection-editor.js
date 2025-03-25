import { inject, LogManager } from "aurelia-framework";
import { Router } from "aurelia-router";
import { CampaignServices } from "CampaignServices.js";
import { Collection } from "Collection.js";
import { CollectionServices } from "CollectionServices.js";
import { UserServices } from "UserServices";
import { I18N } from "aurelia-i18n";
import settings from "global.config.js";
let logger = LogManager.getLogger("CollectionEditor.js");

let COUNT = 9;

@inject(CampaignServices, CollectionServices, UserServices, Router, I18N)
export class CollectionEditor {
  constructor(
    campaignServices,
    collectionServices,
    userServices,
    router,
    i18n
  ) {
    this.project = settings.project;
    this.loc = window.location.href.split("/")[3];
    this.campaignServices = campaignServices;
    this.collectionServices = collectionServices;
    this.userServices = userServices;
    this.router = router;
    this.i18n = i18n;
    this.more = true;
    this.collectionsCount = 0;
    this.collections = [];
    this.loading = false;
    this.offset = 0;
    this.mineCollectionsCount = 0;
    this.sharedCollectionsCount = 0;
  }

  get isAuthenticated() {
    return this.userServices.isAuthenticated();
  }
  get user() {
    return this.userServices.current;
  }
  get totalCollectionsCount() {
    return this.mineCollectionsCount + this.sharedCollectionsCount;
  }

  activate(params, route) {
    if (this.i18n.getLocale() != this.loc) {
      this.i18n.setLocale(this.loc);
    }
    if (this.user) {
      this.getCollectionsByUser();
    }
  }

  userHasShareRights(collection) {
    let right = false;
    collection.data.administrative.access.acl.forEach((user) => {
      if (user.user == this.user.dbId && user.level == "OWN") {
        right = true;
        return;
      }
    });
    return right;
  }

  getCollectionCount() {
    this.collectionServices.countMyAndSharedCollections().then((response) => {
      this.mineCollectionsCount =
        response.my.SimpleCollection + response.my.Exhibition;
      this.sharedCollectionsCount =
        response.sharedWithMe.SimpleCollection +
        response.sharedWithMe.Exhibition;
    });
  }

  getCollectionsByUser() {
    this.loading = true;
    this.getCollectionCount();

    this.collectionServices
      .getReadableCollections(this.offset, COUNT, this.user.username)
      .then((response) => {
        this.collectionsCount += response.collectionsOrExhibitions.length;
        this.offset += COUNT;
        this.more = response.collectionsOrExhibitions.length >= COUNT;
        if (response.collectionsOrExhibitions.length > 0) {
          for (let i in response.collectionsOrExhibitions) {
            this.collections.push(
              new Collection(response.collectionsOrExhibitions[i])
            );
          }
        }
        this.userServices.reloadCurrentUser();
        this.loading = false;
      });
  }

  loadMore() {
    this.getCollectionsByUser();
  }

  newCollection() {
    this.closeShareNav();
    this.edittype = "new";
    this.editableCollectionId = "";
    document.getElementById("editSidebar").style.width = "450px";
    document.getElementById("editSidebar").style.boxShadow =
      "0px 0px 10px 0px rgba(0,0,0,.6)";
  }

  editCollection(collection) {
    this.closeShareNav();
    this.edittype = "edit";
    this.editableCollectionId = collection.dbId;
    document.getElementById("editSidebar").style.width = "450px";
    document.getElementById("editSidebar").style.boxShadow =
      "0px 0px 10px 0px rgba(0,0,0,.6)";
  }

  shareCollection(collection) {
    this.closeNav();
    this.collectionToShare = collection;
    document.getElementById("shareSidebar").style.width = "450px";
    document.getElementById("shareSidebar").style.boxShadow =
      "0px 0px 10px 0px rgba(0,0,0,.6)";
  }

  closeShareNav() {
    document.getElementById("shareSidebar").style.width = "0";
    document.getElementById("shareSidebar").style.boxShadow = "none";
  }

  closeNav() {
    this.selectedAccess = this.edit ? this.collection.isPublic : false;
    this.title = this.edit ? this.collection.title : "";
    this.desc = this.edit ? this.collection.description : "";
    document.getElementById("editSidebar").style.width = "0";
    document.getElementById("editSidebar").style.boxShadow = "none";
  }

  closeAfterSave(title, description, access, locales) {
    let emptyTitle = true;
    for (const [key, value] of Object.entries(title)) {
      if (key === "default") continue;
      if (value !== "") {
        emptyTitle = false;
        break;
      }
    }
    if (emptyTitle) {
      toastr.error("The collection title is required.");
      return;
    }
    let titleObject = { default: title["en"] ? [title["en"]] : [""] };
    let descriptionObject = {
      default: description["en"] ? [description["en"]] : [""],
    };

    for (let loc of locales) {
      titleObject[loc.code] = title[loc.code] ? [title[loc.code]] : [""];
      descriptionObject[loc.code] = description[loc.code]
        ? [description[loc.code]]
        : [""];
    }
    if (this.edittype === "new") {
      let collectiontosave = {
        resourceType: "SimpleCollection",
        administrative: {
          access: {
            isPublic: access,
          },
        },
        descriptiveData: {
          label: titleObject,
          description: descriptionObject,
        },
      };
      this.collectionServices
        .save(collectiontosave)
        .then((response) => {
          if (response.status !== 200) {
            if (response.statusText) {
              throw new Error(response.statusText);
            } else if (response.error) {
              throw new Error(response.error);
            }
          }

          if (!this.userServices.current) {
            toastr.error("An error has occurred. You are no longer logged in!");
            return;
          }

          /* change editables and user collections */
          toastr.success("Collection saved successfully!");
          document.getElementById("editSidebar").style.width = "0";
          document.getElementById("editSidebar").style.boxShadow = "none";
          this.collections = [];
          this.collectionsCount = 0;
          this.offset = 0;
          this.getCollectionsByUser();
        })
        .catch((error) => {
          toastr.error(error.message);
        });
    } else if (this.edittype === "edit") {
      let collectiontosave = {
        resourceType: "SimpleCollection",
        administrative: {
          access: {
            isPublic: access,
          },
        },
        descriptiveData: {
          label: titleObject,
          description: descriptionObject,
        },
      };
      this.collectionServices
        .update(this.editableCollectionId, collectiontosave)
        .then((response) => {
          if (response.status !== 200) {
            if (response.statusText) {
              throw new Error(response.statusText);
            } else if (response.error) {
              throw new Error(response.error);
            }
          }
          toastr.success("Collection updated");
          document.getElementById("editSidebar").style.width = "0";
          document.getElementById("editSidebar").style.boxShadow = "none";
          this.collections = [];
          this.collectionsCount = 0;
          this.offset = 0;
          this.getCollectionsByUser();
        })
        .catch((error) => {
          this.closeTab();
          toastr.error(error.message);
        });
    }
  }

  deleteCollection(collection) {
    let message = this.i18n.tr("dashboard:deleteCollectionMessage");
    if (window.confirm(message)) {
      this.collectionServices.delete(collection.dbId).then((response) => {
        this.collections = [];
        this.collectionsCount = 0;
        this.offset = 0;
        this.getCollectionsByUser();
      });
    }
  }
}
