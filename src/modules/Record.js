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
import settings from 'global.config.js';
import { JsonUtils } from 'JsonUtils.js';

export class Record {

	constructor(data) {
		this.myfullimg = this.getGlobal('/img/assets/img/loader.gif');
		this.imgworks = false;
		this.source_uri = '';
		this.externalId=-1;
		this.dataProvider = '';
		this.provider = '';
		this.source = '';
		this.likes = '';
		this.rights = '';
		this.mediatype = '';
		this.mediaType = null;
		this.creator = '';
		this.vtype = 'IMAGE';
		//this.mediatype='IMAGE';
		if (data) {
			this.mediaType = 'VIDEO';
			this.loadData(data);
		}
	}

	loadData(data) {
		this.dbId = data.dbId;

		if (data.descriptiveData.label && data.descriptiveData.label.default) {
			this.title = data.descriptiveData.label.default.join(" and ");
		}
		if (data.descriptiveData.description && data.descriptiveData.description.default) {
			this.description = data.descriptiveData.description.default.join("</br>");
		}

		if (data.descriptiveData.description) {
			//data.descriptiveData.description = data.descriptiveData.description.default.join("</br>");
			this.alldescription = data.descriptiveData.description;
			this.descriptionlangs = [];
			let langs = Object.keys(this.alldescription);
			for (let i = 0; i < langs.length; i++) {
				//  if(langs[i]=="default" && langs.length>2){
				// 	 this.descriptionlangs.push({lang: langs[i], id: 'description-language-'+langs[i]});
				//  }
				 if (langs[i] !== "default" && langs[i] !== "unknown") {
					 if (this.description == this.alldescription[langs[i]]) {
					 	this.defaultlanguage = langs[i];
					 }
					this.descriptionlangs.push({lang: langs[i], id: 'description-language-' + langs[i]});

				}
			}
			this.annotations = data.annotationIds ? data.annotationIds : [];
		}


		if (data.descriptiveData.creator) {
			this.creator = data.descriptiveData.creator;
		}
		else if (data.descriptiveData.dccreator) {
			if(data.descriptiveData.dccreator.default){
			  this.creator = data.descriptiveData.dccreator.default[0];}
		}
		//now try to read any remaining dc fields
		this.dcfields=[];
		for(let k in data.descriptiveData){
			//alert(k);
			if((k.startsWith('dc') && k.toLowerCase()!="dccreator") || k=="keywords"){
				var val=data.descriptiveData[k];
			    var langsfield = [];
				var langs = Object.keys(val);
				var values=[];
				for (let i = 0; i < langs.length; i++) {
					if (langs[0] == "default" && langs.length<=2) {
						if(langs[1] && langs[1]!=="unknown"){
							langsfield.push({lang: langs[1]});}
						else{
							langsfield.push({lang:'default'});}
						values.push(val['default']);
						break;
				    }
					else if (langs[i] !== "default" && langs[i] !== "unknown") {

						langsfield.push({lang: langs[i], id: k+'-language-' + langs[i]});
						values.push(val[langs[i]]);

					}
				}
				if(values.length>0){
					let newlabel=k;
					if(k=="keywords"){
						newlabel="keywords";
					}
					else if(k.indexOf('dcterms')!=-1){
						newlabel=k.substring(7,k.length);
					}
					else{
						newlabel=k.substring(2,k.length);
					}
					let newdc=new Object({label:newlabel, value:values, langs:langsfield});
				    this.dcfields.push(newdc);}

			}


		}

		this.thumbnail = data.media && data.media[0] && data.media[0].Thumbnail && data.media[0].Thumbnail.withUrl && data.media[0].Thumbnail.withUrl.length>0 ? data.media[0].Thumbnail.withUrl : null;
		if (this.thumbnail) {
			if (!this.thumbnail.startsWith('http')) {
				this.thumbnail=`${settings.baseUrl}${this.thumbnail}`;}
		}

		if (data.administrative && data.administrative.externalId) {
			this.externalId = data.administrative.externalId;
		}
		if (data.collectdIn) {
			this.collectedIn = data.collectedIn;
		}
		if (data.provenance) {
			this.source_uri = JsonUtils.findProvenanceValues(data.provenance, 'source_uri');
			if(this.source_uri.startsWith('record/')){
				//replace with within link
				this.source_uri='/#/item/'+this.dbId;
			}
			this.dataProvider = JsonUtils.findProvenanceValues(data.provenance, 'dataProvider');
			this.provider = JsonUtils.findProvenanceValues(data.provenance, 'provider');
			this.source = JsonUtils.findProvenanceValues(data.provenance, 'source');
		}

		if (data.usage) {
			this.likes = data.usage.likes;
			this.collected = data.usage.collected;
		}

		this.fullres = data.media && data.media[0].Original && data.media[0].Original.withUrl && data.media[0].Original.withUrl.length>0 ? data.media[0].Original.withUrl : null;
		/*needs checking: do we search for withUrl or .url? doing both for now*/
		if (!this.fullres || data.media[0].Original.type !== 'IMAGE') {
			this.fullres = data.media && data.media[0].Original && data.media[0].Original.url ? data.media[0].Original.url : null;
		}
		this.medium = data.media && data.media[0].Medium && data.media[0].Medium.url ? data.media[0].Medium.url : null;
		this.square = data.media && data.media[0].Square && data.media[0].Square.url ? data.media[0].Square.url : null;
		this.tiny = data.media && data.media[0].Tiny && data.media[0].Tiny.url ? data.media[0].Tiny.url : null;
		if (this.fullres) {
			this.rights = JsonUtils.findResOrLit(data.media[0].Original.originalRights);
			this.mediatype = data.media[0].Original.type;

		} else if (this.thumbnail) {
			this.rights = JsonUtils.findResOrLit(data.media[0].Thumbnail.originalRights);
			this.mediatype = data.media[0].Thumbnail.type;

		}

		this.fullresLogic();


		this.loc = location.href.replace(location.hash, '') + '#/item/' + this.dbId;

		this.facebook = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(this.loc);
		this.twitter = 'https://twitter.com/share?url=' + encodeURIComponent(this.loc) + '&text=' + encodeURIComponent(this.title + ' on ' + window.location.host);
		this.mail = 'mailto:?subject=' + this.title + '&body=' + encodeURIComponent(this.loc);

		this.vtype = this.mediatype === 'VIDEO' || this.mediatype === 'AUDIO' ? 'MEDIA' : 'IMAGE';

		this.data = data;
	}

	getPinterest() {
		let url = encodeURIComponent(this.loc);

		let media = encodeURIComponent(this.fullresImage);
		let desc = encodeURIComponent(this.title + ' on ' + window.location.host);
		window.open('//www.pinterest.com/pin/create/button/' +
			'?url=' + url +
			'&media=' + media +
			'&description=' + desc, '', 'height=500,width=750');
		return false;
	}

	get Thumbnail() {
		if (this.thumbnail) {
			if (this.thumbnail.startsWith('http')) {
				return `${this.thumbnail}`;
			}
			return `${settings.baseUrl}${this.thumbnail}`;
		}
		return '/img/assets/img/ui/ic-noimage.png';
	}


	get ItemviewThumbnail() {
		if (this.thumbnail) {
			if (this.thumbnail.startsWith('http')) {
				return `${this.thumbnail}`;
			}
			return `${settings.baseUrl}${this.thumbnail}`;
		}
		return '/img/assets/img/loader.gif';
	}

imageExists(image_url){
    var http = new XMLHttpRequest();
    http.open('HEAD', image_url, false);
    http.send();
		console.log("status "+http.status);
    return http.status == 200;
}


	getGlobal(url){
		if (url) {
			if (url.startsWith('http')) {
				return url;
			}
			return settings.baseUrl+url;
		}
		return url;
	}

	getItemviewThumbnail() {
		if (this.data && this.thumbnail) {
			if (this.thumbnail.startsWith('http')) {
				return `${this.thumbnail}`;
			}
			return `${settings.baseUrl}${this.thumbnail}`;
		}
		return '/img/assets/img/loader.gif';
	}

	get fullresImage() {
		if (this.fullres) {
			if (this.fullres.startsWith('http')) {
				return `${this.fullres}`;
			}
			return `${settings.baseUrl}${this.fullres}`;
		}

		return this.ItemviewThumbnail;
	}


	get fullresExhImage() {
		if (this.fullres) {
			if (this.fullres.startsWith('http')) {
				return `${this.fullres}`;
			}
			return `${settings.baseUrl}${this.fullres}`;
		}

		return this.Thumbnail;
	}

fullresLogic(){
	this.myfullimg = this.getGlobal('/img/assets/img/loader.gif');
	if (this.thumbnail){
		this.checkThumbnail();
	}
	if (this.fullres) {
		this.checkFullress();
	}
}
	checkFullress(){
		let self1=this;
		// console.log("checking Fullres for "+this.title);
		let fr = this.getGlobal(this.fullres);
		this.checkImage(fr,
							function(){
								// console.log("Works Fullres for "+self1.title);
								// console.log("Works Fullres for "+fr);
								self1.myfullimg=fr;
								self1.imgworks = true;
							},
							function(){
								// console.log("Not working Fullres for "+self1.title);
								// console.log("Not working Fullres for "+fr);
								if (!self1.imgworks){
									self1.myfullimg = self1.getGlobal('/img/assets/img/ui/ic-noimage.png');
								  console.log("no images found");
								}
							}
						);
	}

	checkThumbnail(){
		// console.log("checking Thumbnail for "+this.title);
		let self1=this;
		let th = self1.getGlobal(self1.thumbnail);
		self1.checkImage(th,
		function(){
			// console.log("Works Thumbnail for "+self1.title);
			// console.log("Works Thumbnail for "+th);
			self1.myfullimg = th;
			self1.imgworks = true;
		},
		function(){
			// console.log("Not working Thumbnail for "+self1.title);
			// console.log("Not working Thumbnail for "+th);

		 }
		);
	}

	checkImage(imageSrc, good, bad) {
    // var img = new Image();
    // img.onload = good;
    // img.onerror = bad;
		// img.src = imageSrc;
// 		$.ajax({
//    url: imageSrc,
//    success: function(data){
//       good();
//    },
// 	 fail: function(data){
// 		 console.log("call bad");
//       bad();
//    },
//    timeout: 1000 //in milliseconds
// });

		$.get(imageSrc)
   .done(good).fail(bad);
  }

	getFullresImage() {
		if (this.fullres) {
			if (this.fullres.startsWith('http')) {
					return `${this.fullres}`;
				}
				return `${settings.baseUrl}${this.fullres}`;
		}

		return this.getItemviewThumbnail();
	}

	get ShortTitle(){
		if(this.title)
		return this.title.replace(/^(.{100}[^\s]*).*/, "$1");
		else return "";
	}


	shortTitle(){
		if(this.title)
		return JsonUtils.truncate(this.title,100,true);
		else return "";
	}


	get sourceCredits() {
		switch (this.source) {
		case 'DPLA':
			return 'dp.la';
		case 'Europeana':
			return 'europeana.eu';
		case 'NLA':
			return 'nla.gov.au';
		case 'DigitalNZ':
			return 'digitalnz.org';
		case 'Youtube':
			return 'youtube.com';
		case 'BritishLibrary':
			return 'www.bl.uk';
		case 'InternetArchive':
			return 'www.archive.org';
		case 'WITHin':
			return 'WITH';
		case 'WITHinASpace':
			return 'WITHinASpace';
		case 'Rijksmuseum':
			return 'www.rijksmuseum.nl';
		case "Historypin":
			return "www.historypin.com";
		case "DBPedia":
			return "dbpedia.com";
		case 'DDB':
			return 'deutsche-digitale-bibliothek.de';
		default:
			return '';
		}



	}

	getContextData() {
		if (this.data.contextData && this.data.contextData.body && !$.isEmptyObject(this.data.contextData.body)) {
			this.annotation = this.data.contextData.body.text.default;
			this.mediaUrl = this.data.contextData.body.mediaUrl;
			if (this.data.contextData.body.mediaType) {
				this.mediaType = this.data.contextData.body.mediaType;
			}
			this.mediaDescription = this.data.contextData.body.mediaDescription;
			this.textPosition = this.data.contextData.body.textPosition;
		}
	}

	get embeddedVideoUrl() {
		if (this.mediaUrl && this.mediaType && this.mediaType === 'VIDEO') {
			let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
			let match = this.mediaUrl.match(regExp);
			if (match && match[2].length === 11) {
				let embeddedVideoPath = 'https://www.youtube.com/embed/' + match[2];

				return embeddedVideoPath;
			}
		}
		return this.mediaUrl;
	}

}
