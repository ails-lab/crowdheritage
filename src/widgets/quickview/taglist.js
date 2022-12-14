import { Annotation } from 'Annotation';

export class Taglist {
  get lang() { return window.location.href.split('/')[3]; }

  clearInstance() {
    this.userId = '';
    this.annotations = [];
    this.geoannotations = [];
    this.colorannotations = [];
    this.commentannotations = [];
    this.pollannotations = [];
  }

  constructor() {
    this.clearInstance();
  }

  activate(params) {
    this.clearInstance();
    this.colorPalette = params.colorPalette || null;
    this.userId = params.userId;
    for (let annotation of params.annotations) {
      let ann = new Annotation(annotation, this.userId, this.lang);
      if (!this.isCreatedBy(ann) && !this.isValidatedBy(ann, 'all')) {
        continue;
      }

      if (ann.motivation === 'Tagging') {
        this.annotations.push(ann);
      }
      else if (ann.motivation === 'GeoTagging') {
        this.geoannotations.push(ann);
      }
      else if (ann.motivation === 'ColorTagging') {
        this.colorannotations.push(ann);
      }
      else if (ann.motivation === 'Commenting') {
        this.commentannotations.push(ann);
      }
      else if (ann.motivation === 'Polling') {
        this.pollannotations.push(ann);
      }
    };
  }

  isCreatedBy(ann) {
    return (ann.createdBy[0].withCreator == this.userId);
  }

  isValidatedBy(ann, valType) {
    if (valType == 'approved') {
      for (let anno of ann.approvedBy) {
        if (anno.withCreator == this.userId) {
          return true;
        }
      }
    }
    else if (valType == 'rejected') {
      for (let anno of ann.rejectedBy) {
        if (anno.withCreator == this.userId) {
          return true;
        }
      }
    }
    else if (valType == 'all') {
      // If not in user-page, always return TRUE, since there we don't filter the annotation list
      if (this.userId.length == 0) {
        return true;
      }
      for (let anno of ann.approvedBy) {
        if (anno.withCreator == this.userId) {
          return true;
        }
      }
      for (let anno of ann.rejectedBy) {
        if (anno.withCreator == this.userId) {
          return true;
        }
      }
    }
    return false;
  }

  isComputerGenerated(ann) {
    if (ann.createdBy[0].generator == "Image Analysis")
      return true;
    else
      return false;
  }

  getStyle(annotation) {
    let color = this.colorPalette.find(color => color.uri == annotation.uri);
    return `background: ${color['cssHexCode']};`;
  }

}
