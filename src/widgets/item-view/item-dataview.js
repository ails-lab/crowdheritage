import { inject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { I18N } from "aurelia-i18n";
import * as wheelzoom from "wheelzoom-revived";
import { UserServices } from "UserServices";
import { RecordServices } from "RecordServices";

const censoredCampaigns = [
  "debias-nisv",
  "debias-apef-en",
  "debias-dff",
  "debias-apef-nl",
  "debias-apef-de",
];

@inject(Router, I18N, UserServices, RecordServices)
export class ItemDataView {
  constructor(router, i18n, userServices, recordServices) {
    this.router = router;
    this.i18n = i18n;
    this.userServices = userServices;
    this.recordServices = recordServices;
    this.wheelzoom = window.wheelzoom;

    this.campaign = null;
    this.record = null;
    this.mediaDiv = "";

    this.previous = null;
    this.recId = "";
    this.loc = "";
    this.metadataView = "";
  }

  attached() {
    this.updateUI();
  }

  activate(params) {
    this.loc = params.loc;
    this.campaign = params.campaign;
    this.record = params.record;
    this.records = params.records;
    this.previous = params.previous;
    this.collectionTitle = params.collectionTitle;
    this.imageErrorCounter = 0;
    this.noImageStyle = "";
    this.instructionsCollapsed =
      JSON.parse(localStorage.getItem("campaignInstructionsCollapsed")) ||
      false;

    this.recId = this.record.dbId;
    this.showMedia();

    if (this.campaign.username == "colours-catwalk") {
      this.metadataView = "widgets/metadata/meta-colours.html";
    } else if (this.campaign.username == "garment-type") {
      this.metadataView = "widgets/metadata/meta-garment.html";
    } else if (this.campaign.username == "opera") {
      this.metadataView = "widgets/metadata/meta-opera.html";
    } else if (this.campaign.username.startsWith("debias")) {
      this.metadataView = "widgets/metadata/meta-debias.html";
    } else if (this.campaign.username.includes("asksa")) {
      this.metadataView = "widgets/metadata/meta-asksa.html";
    } else {
      this.metadataView = "widgets/metadata/meta-music.html";
    }
  }

  get isLiked() {
    return this.recordServices.isLiked(this.record.externalId);
  }
  get campaignIsCensored() {
    return censoredCampaigns.includes(this.campaign.username);
  }

  toggleInstructions() {
    this.instructionsCollapsed = !this.instructionsCollapsed;
    localStorage.setItem(
      "campaignInstructionsCollapsed",
      JSON.stringify(this.instructionsCollapsed)
    );
    this.updateUI();
  }

  updateUI() {
    const infobar = document.querySelector(".infobar");
    const chevron = document.querySelector(".chevron");

    if (this.instructionsCollapsed) {
      infobar.classList.remove("expanded");
      chevron.classList.remove("rotated");
    } else {
      infobar.classList.add("expanded");
      chevron.classList.add("rotated");
    }
  }

  hasMotivation(name) {
    return !!this.campaign.motivation.includes(name);
  }

  getPlaceholderImage(evt) {
    if (this.imageErrorCounter >= 1) {
      evt.srcElement.src = "/img/assets/img/ui/ic-noimage.png";
      this.noImageStyle = "pointer-events: none";
    } else {
      evt.srcElement.src = this.record.thumbnail;
    }
    this.imageErrorCounter++;
  }

  openModal() {
    if (this.imageErrorCounter >= 2) return;
    var modal = document.getElementById("myModal");
    var banner = document.getElementById("banner");
    modal.style.display = "block";
    banner.style.display = "none";

    const fullsizeImage = document.getElementById("modalImg");
    this.wheelzoom(fullsizeImage, { zoom: 0.25, maxZoom: 10 });
  }

  closeModal() {
    this.wheelzoom.resetAll;
    const fullsizeImage = document.getElementById("modalImg");
    fullsizeImage.src = this.getValidImg(this.record, this.record.myfullimg);

    var modal = document.getElementById("myModal");
    var banner = document.getElementById("banner");
    banner.style.display = "block";
    modal.style.display = "none";
  }

  getValidImg(rec, alt) {
    if (
      this.campaign.username === "garment-type" ||
      this.campaign.username === "garment-classification"
    )
      return rec.myfullimg;
    else return alt;
  }

  likeRecord() {
    document.body.style.cursor = "wait";
    if (this.isLiked) {
      this.recordServices
        .unlike(this.record.externalId)
        .then(() => {
          let index = this.userServices.current.favorites.indexOf(
            this.record.externalId
          );
          if (index > -1) {
            this.userServices.current.favorites.splice(index, 1);
            this.userServices.current.count.myFavorites -= 1;
          }
          document.body.style.cursor = "default";
        })
        .catch((error) => {
          toastr.error(error.message);
          document.body.style.cursor = "default";
        });
    } else {
      this.recordServices
        .like(this.record.data)
        .then(() => {
          let index = this.userServices.current.favorites.indexOf(
            this.record.externalId
          );
          if (index == -1) {
            this.userServices.current.favorites.push(this.record.externalId);
            this.userServices.current.count.myFavorites += 1;
            document.body.style.cursor = "default";
          }
        })
        .catch((error) => {
          toastr.error(error.message);
          document.body.style.cursor = "default";
        });
    }
  }

  checkURL(url) {
    if (url) {
      return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
    }
    return false;
  }

  showMedia() {
    if (
      this.record.source_uri &&
      !this.checkURL(this.record.source_uri) &&
      this.record.source_uri.indexOf("archives_items_") > -1
    ) {
      var id = this.record.source_uri.split("_")[2];
      this.mediaDiv =
        '<div><iframe id="mediaplayer" src="http://archives.crem-cnrs.fr/archives/items/' +
        id +
        '/player/346x130/" height="250px" scrolling="no" width="361px"></iframe></div>';
    } else if (this.record.mediatype == "WEBPAGE") {
      this.mediaDiv =
        '<div><iframe id="mediaplayer" src="' +
        this.record.fullresImage +
        '" width="100%" height="600px"></iframe></div>';
    } else {
      if (
        this.record.mediatype == "VIDEO" &&
        !this.checkURL(this.record.fullresImage)
      ) {
        this.mediaDiv =
          '<video id="mediaplayer" controls width="576" height="324"><source src="' +
          this.record.fullresImage +
          '">Your browser does not support HTML5</video>';
      } else if (
        this.record.mediatype == "AUDIO" &&
        !this.checkURL(this.record.fullresImage)
      ) {
        if (this.record.thumbnail) {
          this.mediaDiv =
            '<div><img src="' +
            this.record.thumbnail +
            '" style="max-width:50%;"/></br></br></div><div><audio id="mediaplayer" controls width="576" height="324"><source src="' +
            this.record.fullresImage +
            '">Your browser does not support HTML5</audio></div>';
        } else {
          this.mediaDiv =
            '<div><img src="/img/assets/img/ui/ic-noimage.png" style="max-width:50%;"/></br></br></div><div><audio id="mediaplayer" controls width="576" height="324"><source src="' +
            this.record.fullresImage +
            '">Your browser does not support HTML5</audio>';
        }
      }
    }
  }
}
