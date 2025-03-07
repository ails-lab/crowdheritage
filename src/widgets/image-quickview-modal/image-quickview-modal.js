import { bindable, observable } from "aurelia-framework";
export class ImageQuickviewModal {
  @bindable src = "";
  @bindable open = false;
  @bindable onClose = null;

  constructor() {
    this.id = "";
    this.imageErrorCounter = 0;
  }

  activate(params) {
    this.id = params.id;
    this.imageErrorCounter = 0;
    console.log(this.id);
  }

  openChanged(isOpen) {
    console.log("openChanged", isOpen);
    if (isOpen) {
      this.openModal();
    } else {
      this.closeModal();
    }
  }

  handleClose() {
    if (typeof this.onClose === "function") {
      this.onClose();
    }
  }

  openModal() {
    console.log("openModa");
    if (this.imageErrorCounter >= 2) return;
    var modal = document.getElementById(this.id);
    var modalImg = document.getElementById("modalImg");
    // var banner = document.getElementById("banner");
    modal.style.display = "block";
    // banner.style.display = "none";
    // modalImg.src = this.config.src;
  }

  closeModal() {
    var modal = document.getElementById(this.id);
    // var banner = document.getElementById("banner");
    // banner.style.display = "block";
    modal.style.display = "none";
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
}
