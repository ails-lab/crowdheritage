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
import settings from "global.config.js";
import { JsonUtils } from "JsonUtils.js";

const LANG = window.location.href.split("/")[3];

export class Record {
  constructor(data) {
    this.myfullimg = this.getGlobal("/img/assets/img/loader.gif");
    this.source_uri = "";
    this.externalId = -1;
    this.dataProvider = "";
    this.provider = "";
    this.source = "";
    this.likes = "";
    this.rights = "";
    this.mediatype = "";
    this.creator = "";
    this.vtype = "IMAGE";
    this.meta = {
      defaultlanguage: "",
      title: "",
      description: "",
      subject: [],
      type: "",
      organizations: [],
    };
    if (data) {
      this.loadData(data);
      this.populateMeta(data);
    }
  }

  loadData(data) {
    this.dbId = data.dbId;

    if (data.descriptiveData.label && data.descriptiveData.label.default) {
      this.title = data.descriptiveData.label.default.join(" and ");
    }
    if (
      data.descriptiveData.description &&
      data.descriptiveData.description.default
    ) {
      this.description = data.descriptiveData.description.default.join("</br>");
    }
    if (data.descriptiveData.description) {
      this.alldescription = data.descriptiveData.description;
      this.descriptionlangs = [];
      let langs = Object.keys(this.alldescription);
      for (let i = 0; i < langs.length; i++) {
        if (langs[i] !== "default" && langs[i] !== "unknown") {
          if (this.description.includes(this.alldescription[langs[i]])) {
            this.defaultlanguage = langs[i];
          }
          this.descriptionlangs.push({
            lang: langs[i],
            id: "description-language-" + langs[i],
          });
        }
      }
    }
    this.annotations = data.annotationIds ? data.annotationIds : [];
    this.annotationObjects = data.annotations ? data.annotations : [];

    if (data.descriptiveData.creator) {
      this.creator = data.descriptiveData.creator;
    } else if (data.descriptiveData.dccreator) {
      if (data.descriptiveData.dccreator.default) {
        this.creator = data.descriptiveData.dccreator.default[0];
      }
    }
    //now try to read any remaining dc fields
    this.dcfields = [];
    for (let k in data.descriptiveData) {
      if (
        (k.startsWith("dc") && k.toLowerCase() != "dccreator") ||
        k == "keywords"
      ) {
        var val = data.descriptiveData[k];
        var langsfield = [];
        var langs = Object.keys(val);
        var values = [];
        for (let i = 0; i < langs.length; i++) {
          if (langs[0] == "default" && langs.length <= 2) {
            if (langs[1] && langs[1] !== "unknown") {
              langsfield.push({
                lang: langs[1],
              });
            } else {
              langsfield.push({
                lang: "default",
              });
            }
            values.push(val["default"]);
            break;
          } else if (langs[i] !== "default" && langs[i] !== "unknown") {
            langsfield.push({
              lang: langs[i],
              id: k + "-language-" + langs[i],
            });
            values.push(val[langs[i]]);
          }
        }
        if (values.length > 0) {
          let newlabel = k;
          if (k == "keywords") {
            newlabel = "keywords";
          } else if (k.indexOf("dcterms") != -1) {
            newlabel = k.substring(7, k.length);
          } else {
            newlabel = k.substring(2, k.length);
          }
          let newdc = new Object({
            label: newlabel,
            value: values,
            langs: langsfield,
          });
          this.dcfields.push(newdc);
        }
      }
    }

    this.thumbnail =
      data.media &&
      data.media[0] &&
      data.media[0].Thumbnail &&
      data.media[0].Thumbnail.withUrl &&
      data.media[0].Thumbnail.withUrl.length > 0
        ? data.media[0].Thumbnail.withUrl
        : null;
    if (this.thumbnail) {
      if (!this.thumbnail.startsWith("http")) {
        this.thumbnail = `${settings.baseUrl}${this.thumbnail}`;
      }
    }
    if (data.administrative && data.administrative.externalId) {
      this.externalId = data.administrative.externalId;
    }
    if (data.collectdIn) {
      this.collectedIn = data.collectedIn;
    }
    if (data.provenance) {
      this.source_uri = JsonUtils.findProvenanceValues(
        data.provenance,
        "source_uri"
      );
      if (this.source_uri.startsWith("record/")) {
        //replace with within link
        this.source_uri = "/#/item/" + this.dbId;
      }
      this.dataProvider = JsonUtils.findProvenanceValues(
        data.provenance,
        "dataProvider"
      );
      this.provider = JsonUtils.findProvenanceValues(
        data.provenance,
        "provider"
      );
      this.source = JsonUtils.findProvenanceValues(data.provenance, "source");
    }

    if (data.usage) {
      this.likes = data.usage.likes;
      this.collected = data.usage.collected;
    }
    this.fullres =
      data.media &&
      data.media[0].Original &&
      data.media[0].Original.withUrl &&
      data.media[0].Original.withUrl.length > 0
        ? data.media[0].Original.withUrl
        : null;
    if (!this.fullres || data.media[0].Original.type !== "IMAGE") {
      this.fullres =
        data.media && data.media[0].Original && data.media[0].Original.url
          ? data.media[0].Original.url
          : null;
    }
    this.medium =
      data.media && data.media[0].Medium && data.media[0].Medium.url
        ? data.media[0].Medium.url
        : null;
    this.square =
      data.media && data.media[0].Square && data.media[0].Square.url
        ? data.media[0].Square.url
        : null;
    this.tiny =
      data.media && data.media[0].Tiny && data.media[0].Tiny.url
        ? data.media[0].Tiny.url
        : null;
    if (this.fullres) {
      this.rights = JsonUtils.findResOrLit(
        data.media[0].Original.originalRights
      );
      this.mediatype = data.media[0].Original.type;
    } else if (this.thumbnail) {
      this.rights = JsonUtils.findResOrLit(
        data.media[0].Thumbnail.originalRights
      );
      this.mediatype = data.media[0].Thumbnail.type;
    }
    this.fullresLogic();

    this.loc = location.href.replace(location.hash, "") + "#/item/" + this.dbId;
    this.facebook =
      "https://www.facebook.com/sharer/sharer.php?u=" +
      encodeURIComponent(this.loc);
    this.twitter =
      "https://twitter.com/share?url=" +
      encodeURIComponent(this.loc) +
      "&text=" +
      encodeURIComponent(this.title + " on " + window.location.host);
    this.mail =
      "mailto:?subject=" + this.title + "&body=" + encodeURIComponent(this.loc);
    this.vtype =
      this.mediatype === "VIDEO" || this.mediatype === "AUDIO"
        ? "MEDIA"
        : "IMAGE";
    this.data = data;
    if (typeof this.data.descriptiveData.dccreator !== "undefined") {
      if (typeof this.data.descriptiveData.dccreator.default !== "undefined") {
        this.creator = this.data.descriptiveData.dccreator.default[0];
      } else if (
        typeof this.data.descriptiveData.dccreator.uri !== "undefined"
      ) {
        this.creator = this.data.descriptiveData.dccreator.uri[0];
        let s1 = this.creator.split("/");
        this.creator =
          '<a href="' +
          this.creator +
          '" target="_blank">' +
          s1[s1.length - 1] +
          "</a>";
      }
    }
  }

  parseJsonld(data) {
    if ("content" in data && "JSONLD-EDM" in data.content) {
      let jsonld = JSON.parse(data.content["JSONLD-EDM"])["@graph"];
      if (jsonld) {
        jsonld.forEach((item) => {
          let type = item["@type"];
          if (type && type === "foaf:Organization") {
            this.meta.organizations.push({
              label: this.getLabel(item["skos:prefLabel"]),
              uri: item["@id"],
            });
          }
        });
      }
    }
  }

  getLabel(prefLabel) {
    if (prefLabel.length) {
      let labels = prefLabel.filter((label) => label["@language"] === LANG);
      return labels.length ? labels[0]["@value"] : prefLabel[0]["@value"];
    } else {
      return prefLabel["@value"];
    }
  }

  getDefaultLanguage(property) {
    if (!property) {
      return "";
    }
    let defaultPropertyLanguage = "default";
    let defaultPropertyValue = JSON.stringify(property.default);
    if (property[LANG]) {
      defaultPropertyLanguage = LANG;
      defaultPropertyValue = JSON.stringify(property[LANG]);
    }
    for (let lang in property) {
      if (
        JSON.stringify(property[lang]) === defaultPropertyValue &&
        lang !== "default"
      ) {
        defaultPropertyLanguage = lang;
        break;
      }
    }
    return defaultPropertyLanguage;
  }

  populateMeta(data) {
    // TODO: Separate the multiple meta values and adjust the behaviour in the tagsub.html
    this.meta.defaultlanguage = this.getDefaultLanguage(
      data.descriptiveData.label
    );
    this.parseJsonld(data);
    this.meta.titleLang = this.getDefaultLanguage(data.descriptiveData.label);
    if (
      data.descriptiveData.label &&
      data.descriptiveData.label[this.meta.titleLang]
    ) {
      this.meta.title =
        data.descriptiveData.label[this.meta.titleLang].join(" ; ");
    }
    this.meta.descriptionLang = this.getDefaultLanguage(
      data.descriptiveData.description
    );
    if (
      data.descriptiveData.description &&
      data.descriptiveData.description[this.meta.descriptionLang]
    ) {
      this.meta.description =
        data.descriptiveData.description[this.meta.descriptionLang].join(
          "<br/>---<br>"
        );
    }
    this.meta.countryLang = this.getDefaultLanguage(
      data.descriptiveData.country
    );
    if (
      data.descriptiveData.country &&
      data.descriptiveData.country[this.meta.titleLang]
    ) {
      this.meta.country =
        data.descriptiveData.country[this.meta.titleLang].join(" ; ");
    }
    this.meta.cityLang = this.getDefaultLanguage(data.descriptiveData.city);
    if (
      data.descriptiveData.city &&
      data.descriptiveData.city[this.meta.cityLang]
    ) {
      this.meta.city =
        data.descriptiveData.city[this.meta.cityLang].join(" ; ");
    }
    if (data.descriptiveData.dates) {
      this.meta.date = data.descriptiveData.dates[0].free;
    }
    if (data.descriptiveData.isRelatedTo) {
      this.meta.relatedToUri = data.descriptiveData.isRelatedTo.uri;
      this.meta.relatedToLabel = decodeURIComponent(
        new URL(data.descriptiveData.isRelatedTo.uri).pathname.split("/").pop()
      );
    }
    if (data.descriptiveData.isShownAt) {
      this.meta.isShownAt = data.descriptiveData.isShownAt;
    }
    this.meta.subjectLang = this.getDefaultLanguage(
      data.descriptiveData.keywords
    );
    if (
      data.descriptiveData.keywords &&
      data.descriptiveData.keywords[this.meta.subjectLang]
    ) {
      this.meta.subject =
        data.descriptiveData.keywords[this.meta.subjectLang].join(" ; ");
    }
    let dctype = this.dcfields.find((field) => field.label === "type");
    if (dctype) {
      let index = dctype.langs.findIndex((l) => l.lang === LANG);
      if (index >= 0) {
        this.meta.type = dctype.value[index].join(", ");
      }
    }
  }

  get Thumbnail() {
    if (this.thumbnail) {
      if (this.thumbnail.startsWith("http")) {
        return `${this.thumbnail}`;
      }
      return `${settings.baseUrl}${this.thumbnail}`;
    }
    return "/img/assets/img/ui/ic-noimage.png";
  }

  getGlobal(url) {
    if (url) {
      if (url.startsWith("http")) {
        return url;
      }
      return settings.baseUrl + url;
    }
    return url;
  }

  getItemviewThumbnail() {
    if (this.data && this.thumbnail) {
      if (this.thumbnail.startsWith("http")) {
        return `${this.thumbnail}`;
      }
      return `${settings.baseUrl}${this.thumbnail}`;
    }
    return "/img/assets/img/loader.gif";
  }

  fullresLogic() {
    this.myfullimg = this.getGlobal("/img/assets/img/loader.gif");
    if (this.thumbnail) {
      this.checkThumbnail();
    }
    if (this.fullres) {
      this.checkFullress();
    }
    if (!this.thumbnail) {
      this.thumbnail = this.myfullimg;
    }
  }

  checkFullress() {
    let self1 = this;
    let fr = this.getGlobal(this.fullres);
    self1.myfullimg = fr;
  }

  checkThumbnail() {
    let self1 = this;
    let th = self1.getGlobal(self1.thumbnail);
    self1.myfullimg = th;
  }

  get fullresImage() {
    if (this.fullres) {
      if (this.fullres.startsWith("http")) {
        return `${this.fullres}`;
      }
      return `${settings.baseUrl}${this.fullres}`;
    }

    return this.getItemviewThumbnail();
  }
}
