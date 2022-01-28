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


import { noView } from 'aurelia-framework';
import { I18N } from 'aurelia-i18n';

@noView
export class ItemCounterValueConverter {
	static inject = [I18N];
	constructor(i18n) {
		this.i18n = i18n;
	}
	toView(values, i18n) {
		let singular = this.i18n.tr('app:'+values[1]);
		let plural = this.i18n.tr('app:'+values[1]+'s');
		return values[0] == 1 ? `1 ${singular}` : `${values[0]} ${plural}`;
	}
}
