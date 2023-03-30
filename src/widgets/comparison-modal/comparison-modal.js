import { inject, LogManager } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { I18N } from 'aurelia-i18n';

let logger = LogManager.getLogger('comparison-modal.js');

@inject(Router, I18N)
export class ComparisonModal {

  constructor(router, i18n) {
    this.router = router;
    this.i18n = i18n;
    this.step = 1;
    this.lens = null;
    this.comparisonOriginalImage = null;
    this.firstAlgorithmResult = null;
    this.secondAlgorithmResult = null;
    this.originalImageZoomed = null;
    this.firstAlgorithmImg = null;
    this.secondAlgorithmImg = null;
    this.originalImg = null;
    this.zoomInitiated = false;
    this.firstSelected = false;
    this.secondSelected = false;
    this.submitted = false;
    this.zoomLevel = 3;
  }

  get locale() { return window.location.href.split('/')[3]; }

  activate() {
  }

  get stepLabel() {
    if (this.step == 1) {
      return '1st';
    }
    if (this.step == 2) {
      return '2nd';
    }
    if (this.step == 3) {
      return '3rd';
    }
    return this.step + 'th';
  }
  closeComparisonModal() {
    if ((this.firstSelected || this.secondSelected || this.step != 1) && !this.submitted &&
      !confirm('If you close the workspace without completing all the comparisons your progress will be lost. Are you sure you want to proceed?')) return;
    var modal = document.getElementById('comparisonModal');
    var banner = document.getElementById("banner");
    banner.style.display = "block";
    modal.style.display = "none";
    if (this.lens) {
      this.stopZoom();
    }
    this.step = 1;
    this.firstSelected = false;
    this.secondSelected = false;
    this.submitted = false;
  }

  nextStep() {
    if (this.lens) {
      this.stopZoom();
    }
    this.firstSelected = false;
    this.secondSelected = false;
    this.step++;
  }

  prevStep() {
    if (this.lens) {
      this.stopZoom();
    }
    this.firstSelected = false;
    this.secondSelected = false;
    this.step--;
  }

  zoomLevelChanged(zoom) {
    if (this.lens) {
      this.stopZoom();
    }
    this.zoomLevel = zoom;
  }

  getZoomWindow(){
    if (this.comparisonOriginalImage.width > this.comparisonOriginalImage.height) {
      this.zoomWindow = this.comparisonOriginalImage.height / this.zoomLevel;
    }
    else{
      this.zoomWindow = this.comparisonOriginalImage.width / this.zoomLevel;
    }
  }

  initiateZoomLens() {
    this.comparisonOriginalImage = document.getElementById('comparison-original-image');
    this.getZoomWindow();

    this.firstAlgorithmImgHeight = document.getElementById("first-algorithm-img").offsetHeight;
    this.originalImgHeight = document.getElementById("original-img").offsetHeight;
    this.secondAlgorithmImgHeight = document.getElementById("second-algorithm-img").offsetHeight;
    /* Create lens: */
    this.lens = document.createElement("DIV");
    this.lens.setAttribute("class", "img-zoom-lens");
    if (this.comparisonOriginalImage.width > this.comparisonOriginalImage.height) {
      this.lens.style.height = this.zoomWindow + "px";
      let ratio = this.comparisonOriginalImage.width / this.comparisonOriginalImage.height;
      this.lens.style.width = (ratio * this.zoomWindow) + "px";
    }
    else {
      this.lens.style.width = this.zoomWindow + "px";
      let ratio = this.comparisonOriginalImage.height / this.comparisonOriginalImage.width;
      this.lens.style.height = (ratio * this.zoomWindow) + "px";
    }
    /* Insert lens: */
    this.comparisonOriginalImage.parentElement.insertBefore(this.lens, this.comparisonOriginalImage);
  }

  initiateZoom(e) {
    if (!this.comparisonOriginalImage || !this.lens) {
      this.initiateZoomLens();
      this.zoomInitiated = true;
    }
    var pos, x, y;
    /* Prevent any other actions that may occur when moving over the image */
    e.preventDefault();
    /* Get the cursor's x and y positions: */
    pos = this.getCursorPos(e);
    /* Calculate the position of the this.lens: */
    x = pos.x + 1;
    y = pos.y + 1;
    /* Prevent the this.lens from being positioned outside the image: */
    if (x > this.comparisonOriginalImage.width - this.lens.offsetWidth) { x = this.comparisonOriginalImage.width - this.lens.offsetWidth; }
    if (x < 0) { x = 0; }
    if (y > this.comparisonOriginalImage.height - this.lens.offsetHeight) { y = this.comparisonOriginalImage.height - this.lens.offsetHeight; }
    if (y < 0) { y = 0; }
    /* Set the position of the this.lens: */
    this.lens.style.left = x + "px";
    this.lens.style.top = y + "px";

    let cx, cy, ratio = this.comparisonOriginalImage.width / this.comparisonOriginalImage.height;


    this.firstAlgorithmResult = document.getElementById("first-algorithm-zoomed");
    /* Calculate the ratio between this.firstAlgorithmResult DIV and lens: */
    if (this.firstAlgorithmResult) {
      this.firstAlgorithmResult.style.height = this.firstAlgorithmImgHeight + "px";
      this.firstAlgorithmResult.style.width = ratio * this.firstAlgorithmImgHeight + "px";
      cx = this.firstAlgorithmResult.offsetWidth / this.lens.offsetWidth;
      cy = this.firstAlgorithmResult.offsetHeight / this.lens.offsetHeight;
      /* Set background properties for the this.firstAlgorithmResult DIV */
      this.firstAlgorithmResult.style.backgroundImage = "url('" + this.comparisonOriginalImage.src + "')";
      this.firstAlgorithmResult.style.backgroundSize = (this.comparisonOriginalImage.width * cx) + "px " + (this.comparisonOriginalImage.height * cy) + "px";
      /* Display what the this.lens "sees": */
      this.firstAlgorithmResult.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
    }

    this.originalImageZoomed = document.getElementById("original-zoomed");

    /* Calculate the ratio between this.originalImageZoomed DIV and this.lens: */
    if (this.originalImageZoomed) {
      this.originalImageZoomed.style.height = this.originalImgHeight + "px";
      this.originalImageZoomed.style.width = ratio * this.originalImgHeight + "px";
      cx = this.originalImageZoomed.offsetWidth / this.lens.offsetWidth;
      cy = this.originalImageZoomed.offsetHeight / this.lens.offsetHeight;
      /* Set background properties for the this.originalImageZoomed DIV */
      this.originalImageZoomed.style.backgroundImage = "url('" + this.comparisonOriginalImage.src + "')";
      this.originalImageZoomed.style.backgroundSize = (this.comparisonOriginalImage.width * cx) + "px " + (this.comparisonOriginalImage.height * cy) + "px";
      /* Display what the this.lens "sees": */
      this.originalImageZoomed.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
    }

    this.secondAlgorithmResult = document.getElementById("second-algorithm-zoomed");

    /* Calculate the ratio between this.secondAlgorithmResult DIV and this.lens: */
    if (this.secondAlgorithmResult) {
      this.secondAlgorithmResult.style.height = this.secondAlgorithmImgHeight + "px";
      this.secondAlgorithmResult.style.width = ratio * this.secondAlgorithmImgHeight + "px";
      cx = this.secondAlgorithmResult.offsetWidth / this.lens.offsetWidth;
      cy = this.secondAlgorithmResult.offsetHeight / this.lens.offsetHeight;
      /* Set background properties for the this.secondAlgorithmResult DIV */
      this.secondAlgorithmResult.style.backgroundImage = "url('" + this.comparisonOriginalImage.src + "')";
      this.secondAlgorithmResult.style.backgroundSize = (this.comparisonOriginalImage.width * cx) + "px " + (this.comparisonOriginalImage.height * cy) + "px";
      /* Display what the this.lens "sees": */
      this.secondAlgorithmResult.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
    }
  }

  getCursorPos(e) {
    var a, x = 0, y = 0;
    e = e || window.event;
    /* Get the x and y positions of the image: */
    a = this.comparisonOriginalImage.getBoundingClientRect();
    /* Calculate the cursor's x and y coordinates, relative to the image: */
    x = e.pageX - a.left;
    y = e.pageY - a.top;
    /* Consider any page scrolling: */
    x = x - window.pageXOffset;
    y = y - window.pageYOffset;
    return { x: x, y: y };
  }

  stopZoom() {
    let lens = document.getElementsByClassName("img-zoom-lens");
    lens[0].remove()
    this.lens = null;
    this.firstAlgorithmResult = null;
    this.secondAlgorithmResult = null;
    this.originalImageZoomed = null;
    this.firstAlgorithmImgHeight = null;
    this.secondAlgorithmImgHeight = null;
    this.originalImgHeight = null;
    this.zoomInitiated = false;
  }

  firstAlgoSelected() {
    this.firstSelected = true;
    this.secondSelected = false;
    if(this.step != 6) {
      setTimeout(() => {
        this.nextStep();
      }, 750);
    }
  }

  secondAlgoSelected() {
    this.firstSelected = false;
    this.secondSelected = true;
    if(this.step != 6) {
      setTimeout(() => {
        this.nextStep();
      }, 750);
    }
  }

  submitComparison() {
    this.submitted = true;
    this.closeComparisonModal();
  }

}
