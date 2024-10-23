/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


import { inject } from 'aurelia-framework';
import { UserServices } from 'UserServices.js';
import { I18N } from 'aurelia-i18n';
import settings from 'global.config.js';

@inject(UserServices, Element, I18N)
export class About {

	constructor(userServices, element, i18n) {
		this.userServices = userServices;
		this.element = element;
		this.i18n = i18n;
		this.project = settings.project;
		this.loc;

    this.generalStatistics = [
      { icon: '../../../img/icons/ic-stat-campaign.png', label: this.i18n.tr('about:campaigns'), value: 51 },
      { icon: '../../../img/icons/ic-stat-contributors.png', label: this.i18n.tr('about:contributors'), value: 1714 },
      { icon: '../../../img/icons/ic-stat-records.png', label: this.i18n.tr('about:records'), value: 51180 },
      { icon: '../../../img/icons/ic-stat-records-annotated.png', label: this.i18n.tr('about:annotated-records'), value: 28471 },
      { icon: '../../../img/icons/ic-stat-annotations.png', label: this.i18n.tr('about:annotations'), value: 139417 },
      { icon: '../../../img/icons/ic-stat-annotations-human.png', label: this.i18n.tr('about:human-annotations'), value: 118294 },
      { icon: '../../../img/icons/ic-stat-annotations-machine.png', label: this.i18n.tr('about:machine-annotations'), value: 21123 },
      { icon: '../../../img/icons/ic-stat-validations.png', label: this.i18n.tr('about:validations'), value: 439631 }
    ];
	}

	get isAuthenticated() { return this.userServices.isAuthenticated(); }

	scrollTo(anchor) {
		$('html, body').animate({
			scrollTop: $(anchor).offset().top
		}, 1000);
	}

	activate(params) {
		this.loc = params.lang;
		this.i18n.setLocale(params.lang);

    if (this.userServices.isAuthenticated() && this.userServices.current === null) {
      this.userServices.reloadCurrentUser();
    }
	}

  attached() {
    $('.accountmenu').removeClass('active');
    let stats = document.getElementsByClassName("stat-number");
    for (let stat of stats) {
      this.animateValue(stat, 0, stat.innerHTML, 1200);
    }
  }

  animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerHTML = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
      else {
        let finalValue = Number(obj.innerHTML);
        obj.innerHTML = finalValue.toLocaleString('en', {useGrouping:true});
      }
    };
    window.requestAnimationFrame(step);
  }
}
