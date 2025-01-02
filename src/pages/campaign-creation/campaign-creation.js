import { inject } from "aurelia-framework";
import { I18N } from "aurelia-i18n";

@inject(I18N)
export class CampaignCreation {
  constructor(i18n) {
    this.i18n = i18n;
    this.loc;
    this.userAlert = false;
  }

  activate(params) {
    this.loc = params.lang;
    this.i18n.setLocale(params.lang);
    this.userAlert = params.user_alert || false;
  }

  attached() {
    $(".accountmenu").removeClass("active");
  }

  scrollTo(anchor) {
    $("html, body").animate(
      {
        scrollTop: $(anchor).offset().top,
      },
      1200
    );
  }
}
