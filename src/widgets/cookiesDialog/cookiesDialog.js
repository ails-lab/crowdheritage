
import { inject, LogManager } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';
import { Router } from 'aurelia-router';
import { I18N } from 'aurelia-i18n';

let logger = LogManager.getLogger('cookiesDialog.js');

@inject(DialogController, Router, I18N)
export class CookiesDialog {

  constructor(controller, router, i18n) {
    this.controller = controller;
    this.router = router;
    this.i18n = i18n;
  }

  get locale() { return window.location.href.split('/')[3]; }
}
