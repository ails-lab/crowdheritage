import { inject, LogManager, NewInstance } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { UserServices } from 'UserServices';
import { Campaign } from 'Campaign.js';
import { CampaignServices } from 'CampaignServices';
import { I18N } from 'aurelia-i18n';
import settings from 'global.config.js';
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
    this.cname = '';
    this.exportState = 'idle';
    this.fileTypes = ['JSON', 'CSV'];
    this.contributorsFileType = 'JSON';
  }

  get user() { return this.userServices.current; }
  get isAuthenticated() { return this.userServices.isAuthenticated(); }

  async activate(params) {
    this.clearInstance();

    this.loc = params.lang;
    this.i18n.setLocale(params.lang);

    this.cname = params.cname;
    this.campaign = params.campaign;
  }
  clearInstance() {
    this.cname = '';
    this.exportState = 'idle';
  }

  exportAnnotations() {
    if (this.exportState === 'exporting') {
      return;
    }
    this.exportState = 'exporting';
    let expLink = document.getElementById('exportAnnotations');
    document.body.style.cursor = 'wait';
    expLink.style.cursor = 'wait';

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
        this.exportState = 'idle';
        document.body.style.cursor = 'default';
        expLink.style.cursor = 'pointer';
      });
  }

  exportContributors(fileType) {
    if (this.exportState === 'exporting') {
      return;
    }
    this.exportState = 'exporting';
    let expLink = document.getElementById('exportUsers');
    document.body.style.cursor = 'wait';
    expLink.style.cursor = 'wait';

    this.campaignServices.getCampaignContributors(this.campaign.username)
      .then(response => {
        var json = response;
        var dataStr = "";
        var downloadAnchorNode = document.createElement('a');
        var filename = `${this.campaign.username}_contributors.${fileType.toLowerCase()}`;

        if (fileType === 'CSV') {
          // Create the downloadable csv file
          var fields = Object.keys(json[0]).slice(0, -1);
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
        this.exportState = 'idle';
        document.body.style.cursor = 'default';
        expLink.style.cursor = 'pointer';
      });
  }

  copyAnnotationsLinkToClipboard() {
    const downloadLink = `${settings.baseUrl}/annotation/export?campaignName=${this.campaign.username}`;
    navigator.clipboard.writeText(downloadLink);
    toastr.success(this.i18n.tr('moderation:copyToClipboardSuccess'));
  }
}
