import { inject, LogManager, NewInstance } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { UserServices } from 'UserServices';
import { Campaign } from 'Campaign.js';
import { CampaignServices } from 'CampaignServices';

import { I18N } from 'aurelia-i18n';
let logger = LogManager.getLogger('CampaignEditor.js');

let COUNT = 9;

@inject(CampaignServices, UserServices, Router, I18N)
export class DataExport {
  constructor(campaignServices, userServices, router, i18n) {
    this.loc = window.location.href.split('/')[3];
    this.userServices = userServices;
    this.router = router;
    this.campaignServices = campaignServices;

    this.i18n = i18n;
    this.isCreator = false;
    this.cname = '';
    this.exportAnnsLabel = "EXPORT ANNOTATIONS";
    this.exportUsersLabel = "EXPORT CONTRIBUTORS";
  }

  get user() { return this.userServices.current; }

  async activate(params) {
    this.clearInstance();

    this.loc = params.lang;
    this.i18n.setLocale(params.lang);

    this.cname = params.cname;
    await this.campaignServices.getCampaignByName(params.cname)
      .then(response => {
        // Based on the selected language, set the campaign
        this.campaign = new Campaign(response, this.loc);
        this.isCreator = (this.isAuthenticated) && (this.campaign.creators.includes(this.user.dbId));

        if (!this.isCreator) {
          let index = this.router.routes.find(x => x.name === 'index');
          this.router.navigateToRoute('index', { lang: 'en' });
        }

        this.campaignServices.getPopularAnnotations(this.campaign.username)
          .then(response => {
            this.popularTags = response;
          });
      })
      .catch(error => {
        console.error(error)
        let index = this.router.routes.find(x => x.name === 'index');
        this.router.navigateToRoute('index', { lang: 'en' });
      });

  }
  clearInstance() {
    this.isCreator = false;
    this.cname = '';
    this.exportAnnsLabel = "EXPORT ANNOTATIONS";
    this.exportUsersLabel = "EXPORT CONTRIBUTORS";

  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }

  exportAnnotations() {
    if (!this.isAuthenticated || !this.isCreator) {
      toastr.error("You have no permission to perform this action");
      return '';
    }

    if (this.exportAnnsLabel === "EXPORTING...") {
      return;
    }

    // While waiting for the process to go through, change the cursor to 'wait'
    let expLink = document.getElementById('exportAnnotations');
    document.body.style.cursor = 'wait';
    expLink.style.cursor = 'wait';
    this.exportAnnsLabel = "EXPORTING...";

    this.campaignServices.exportCampaignAnnotations(this.campaign.username)
      .then(response => {
        // Create the downloadable json file and download it
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response, null, "\t"));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", this.campaign.username + "_annotations.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

        // When the process is finished, change the cursor back to 'default'
        document.body.style.cursor = 'default';
        expLink.style.cursor = 'pointer';
        this.exportAnnsLabel = "EXPORT ANNOTATIONS";
      });
  }

  exportContributors(fileType) {
    if (!this.isAuthenticated || !this.isCreator) {
      toastr.error("You have no permission to perform this action");
      return '';
    }

    if (this.exportUsersLabel === "EXPORTING...") {
      return;
    }

    // While waiting for the process to go through, change the cursor to 'wait'
    let expLink = document.getElementById('exportUsers');
    document.body.style.cursor = 'wait';
    expLink.style.cursor = 'wait';
    this.exportUsersLabel = "EXPORTING...";

    this.campaignServices.getCampaignContributors(this.campaign.username)
      .then(response => {
        var json = response;
        var dataStr = "";
        var downloadAnchorNode = document.createElement('a');
        var filename = `${this.campaign.username}_contributors.${fileType}`;

        if (fileType === 'csv') {
          // Create the downloadable csv file
          var fields = Object.keys(json[0]);
          var replacer = function (key, value) { return value === null ? '' : value };
          var csv = json.map(function (row) {
            return fields.map(function (fieldName) {
              return JSON.stringify(row[fieldName], replacer);
            }).join(',');
          });
          csv.unshift(fields.join(',')); // add header column
          csv = csv.join('\r\n');
          dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
        }
        else {
          dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json, null, '\t'));
        }

        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", filename);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

        // When the process is finished, change the cursor back to 'default'
        document.body.style.cursor = 'default';
        expLink.style.cursor = 'pointer';
        this.exportUsersLabel = "EXPORT CONTRIBUTORS";
      });
  }
}
