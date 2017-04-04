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


/* eslint-disable */
export class JsonUtils {

	static findByLang(val, language) {
		if (language == undefined || language == null)
			language = "default";
		if (val !== undefined && val !== null)
			if (val[language]) {
				var label = val[language];
				if (val[language][0]) {
					label = val[language][0];
				}
				if (label)
					return label;
			}
		return "";

	}

	static findProvenanceValues(array, selection) {
		let selvalue = "";
		if (selection == "dataProvider") {
			if (array.length > 1 && array[0].provider)
				selvalue = array[0].provider;


		} else if (selection == "dataProvider_uri") {
			if (array.length > 1) {
				selvalue = array[0].uri;

				if (array[0].uri && array[0].uri.length > 0) {
					selvalue = array[0].uri;
				}

			}
		} else if (selection == "provider") {
			if (array.length == 3) {

				if (array[1].uri && array[1].uri.length > 0) {
					if (array[1].provider && array[1].provider.length > 0) {
						selvalue = "<a href='" + array[1].uri + "' target='blank'>" + array[1].provider + "</a>";
					}

				} else if (array[1].provider) {
					selvalue += array[1].provider;
				}

			}
		} else if (selection == "provider_uri") {
			if (array.length == 3)
				if (array[1].uri && array[1].uri.length > 0) {

					selvalue = array[1].uri;
				}


		} else if (selection == "source") {
			var size = array.length - 1;
			if (array[size].provider) {
				selvalue += array[size].provider;
			}

		} else if (selection == "source_uri") {
			var size = array.length - 1;
			if (array[size].uri && array[size].uri.length > 0) {
				selvalue = array[size].uri;
			} else if (size > 0 && array[size - 1].uri && array[size - 1].uri.length > 0) {
				selvalue = array[size - 1].uri;
			}

		} else if (selection == "id") {
			var size = array.length - 1;
			if (array[size].resourceId && array[size].resourceId.length > 0) {

				selvalue += array[size].resourceId;
			}


		}
		return selvalue;

	}


	static findResOrLit(data) {

		let selvalue = "";
		let uilang = "default";

		if (data) {
			if (data[uilang]) {
				selvalue = data[uilang];
			} else if (data.uri) {
				selvalue = data.uri;
			} else if (data["en"]) {

				selvalue = data["en"];
			}
		}
		return selvalue;

	}
	
	static truncate(words, n,useWordBoundary){
		var isTooLong = words.length > n,
	    s_ = isTooLong ? words.substr(0,n-1) : words;
	    s_ = (useWordBoundary && isTooLong) ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
	    return  isTooLong ? s_ + '&hellip;' : s_;
	};
	
	
	static filterName(id){
		let name=null;
		switch(id && id.toLowerCase()){
		case 'provenance.provider':
	        name="Provider";
	        break;
		case 'provenance.dataprovider':
	        name="Data provider";
	        break;
	    case 'dccreator.default':
	        name = "Creator";
	        break;
	    case 'dccontributor.default':
	        name="Contributor";
	        break;
	    case 'media.mimetype':
	        name="Mime type";
	        break;
	    case 'media.type':
	        name="Type";
	        break;
	    case 'descriptivedata.country':
	        name="Spatial";
	        break;
	    case 'descriptivedata.dccreator':
	        name="Creator";
	        break;
	    case 'descriptivedata.dccontributor':
	        name="Contributor";
	        break;
	    case 'media.withrights':
	        name="Rights";
	        break;
	    case 'descriptivedata.dcdate.year':
	        name="Dates";
	        break;
	    default:break;
		}
		return name;
	}

}
