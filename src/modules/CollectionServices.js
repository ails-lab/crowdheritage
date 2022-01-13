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
import { HttpClient, json } from 'aurelia-fetch-client';
import fetchConfig from 'fetch.config.js';
import { checkStatus } from 'fetch.config.js';
import { UserServices } from 'UserServices.js';

@inject(HttpClient, UserServices)
export class CollectionServices {

  constructor(http, userServices) {
    http.configure(fetchConfig);
    this.http = http;
    this.userServices = userServices;
  }

  // Collection retrieval
  async getCollection(id, filterForLocale = true) {
    return this.http.fetch(`/collection/${id}?filterForLocale=${filterForLocale}`, {
      method: 'GET'
    }).then((response) => response.json());
  }

  // Records retrieval
  async getRecords(id, offset, count, hideMine) {
    return this.http.fetch('/collection/' + id + '/list?' + 'start=' + offset + '&count=' + count + '&locale=ALL' + '&hideMyAnnotated=' + (hideMine === 'hide'), {
      method: 'GET'
    }).then((response) => response.json());
  }

  searchForRecords(collectionId, term, offset, count) {
    return this.http.fetch(`/api/searchCollection/${collectionId}?offset=${offset}&count=${count}&term=*${term}*`, {
      method: 'GET'
    }).then((response) => response.json());
  }

  getRecordsByTerms(id, offset, count, data) {
    return this.http.fetch('/collection/' + id + '/selectionlist?' + 'start=' + offset + '&count=' + count, {
      method: 'POST',
      body: JSON.stringify(this.selectedTerms2JSON(data)),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => response.json());
  }

  // Retrieve records in order of similarity wrt recId
  getSimilarRecords(id, recId, offset, count) {
    return this.http.fetch(`/collection/${id}/similarlist?itemid=${recId}&count=${count}&start=${offset}`, {
      method: 'GET'
    }).then((response) => response.json());
  }


  getMultipleCollections(idArray, offset, count, filterForLocale = true) {
    let idstr = '';
    for (let i = offset; i < (offset + count); i++) {
      if (idstr.length > 0) {
        idstr += '&';
      }

      idstr += 'id=' + idArray[i];
    }
    return this.http.fetch(`/collection/multiple?${idstr}&filterForLocale=${filterForLocale}`, {
      method: 'GET'
    }).then(checkStatus).then((response) => {
      return response.json();
    });
  }

  getMultipleMultilingualCollections(idArray, offset, count) {
    let idstr = '';
    for (let i = offset; i < (offset + count); i++) {
      if (idstr.length > 0) {
        idstr += '&';
      }

      idstr += 'id=' + idArray[i];
    }
    return this.http.fetch('/collection/multipleWithAllLangs?' + idstr, {
      method: 'GET'
    }).then(checkStatus).then((response) => {
      return response.json();
    });
  }

  // Get thesauri for collection
  getVocabularies(id, data) {
    return this.http.fetch(`/collection/${id}/facets`, {
      method: 'POST',
      body: JSON.stringify(this.selectedTerms2JSON(data)),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => response.json());
  }

  selectedTerms2JSON(data) {
    let terms = [];

    for (let i = 0; i < data.length; i++) {
      let str = data[i].uri;

      if (str.startsWith('http://')) {
        terms.push(str);
      }
    }

    return { terms };
  }

  // Collections/Exhibitions retrieval
  getCollections(offset, count, collectionHits, isExhibition, creator, isPublic, sortBy = 'Date') {
    if (creator) {
      creator = '&creator=' + creator;
    } else {
      creator = '';
    }
    if (isPublic) {
      isPublic = '&isPublic=' + isPublic;
    } else {
      isPublic = '';
    }

    return this.http.fetch('/collection/list?' + 'offset=' + offset + '&count=' + count + '&collectionHits=' + collectionHits + '&isExhibition=' + isExhibition + creator + isPublic + '&sortBy=' + sortBy, {
      method: 'GET'
    }).then((response) => response.json());
  }

  deleteUserGroup(id) {
    return this.http.fetch(`/group/${id}`, {
      method: 'DELETE'
    }).then(checkStatus).then((response) => response.json());
  }

  getUserGroups(offset, count) {
    return this.http.fetch('/group/list?' + 'offset=' + offset + '&count=' + count + '&belongsOnly=true&prefix=*', {
      method: 'GET'
    }).then((response) => response.json());
  }

  parsedJsonResponse(jsonResponse, isSearch, isExhibition) {
    if (isSearch) {
      return [jsonResponse.results[0].items, jsonResponse.results[0].totalCount];
    }
    return [jsonResponse.collectionsOrExhibitions, isExhibition ? jsonResponse.totalExhibitions : jsonResponse.totalCollections];
  }

  //Using Named Parameters
  getCollectionsGeneric({ offset = 0, count = 12, collectionHits = true, term = '', isShared = false, isExhibition = false, creator = this.userServices.current.username, sortBy = 'Date' } = {}) {
    let url; let isSearch;
    if (term !== '' && term !== '**') {
      url = '/api/searchMyCollections';
      isSearch = true;
    } else {
      url = isShared ? '/collection/listShared' : '/collection/list';
      isSearch = false;
      //totalCountPath =  isExhibition ? 'totalExhibitions' : 'totalCollections';
      //resultsArrayPath = 'collectionsOrExhibitions';
    }
    return this.http.fetch(`${url}?offset=${offset}&count=${count}&collectionHits=${collectionHits}&term=${term}&isShared=${isShared}&isExhibition=${isExhibition}&creator=${creator}&sortBy=${sortBy}`, {
      method: 'GET'
    }).then((response) => response.json())
      .then((jsonResponse) => this.parsedJsonResponse(jsonResponse, isSearch, isExhibition));
  }

  getPublicCollections(offset, count, collectionHits, isExhibition, creator) {
    if (creator) {
      creator = '&creator=' + creator;
    } else {
      creator = '';
    }

    return this.http.fetch('/collection/listPublic?' + 'offset=' + offset + '&count=' + count + '&collectionHits=' + collectionHits + '&isExhibition=' + isExhibition + creator, {
      method: 'GET'
    }).then((response) => response.json());
  }


  /*searchPublicCollections(offset, count, isExhibition, term, spaceId) {
    let spaceIdQuery = spaceId === null ? '' : '&spaceId=' + spaceId;
    return this.http.fetch('/api/searchPublicCollections?' + 'offset=' + offset + '&count=' + count + '&term=*' + term + '*&isExhibition=' + isExhibition + spaceIdQuery, {
      method: 'GET'
    }).then((response) => response.json());
  }*/


  searchPublicCollections(query) {
    console.log(JSON.stringify(query));
    return this.http.fetch('/api/search2', {
      method: 'POST',
      body: json(query),
      headers: {
        'Content-Type': 'application/json'
        // More options
      }
    }).then(checkStatus).then((response) => response.json());

  }

  getCollectionsSharedWithMe(offset, count, collectionHits, isExhibition, sortBy = 'Date') {
    return this.http.fetch(`/collection/listShared?offset=${offset}&count=${count}&isExhibition=${isExhibition}&collectionHits=${collectionHits}&sortBy=` + sortBy)
      .then(checkStatus)
      .then((response) => response.json());
  }

  // username or groupname
  getEditableCollections(offset, count, username) {
    return this.http.fetch('/collection/list?' + 'offset=' + offset + '&count=' + count + '&directlyAccessedByUserOrGroup=' + JSON.stringify([{
      user: username,
      rights: 'WRITE'
    }]), {
      method: 'GET'
    }).then((response) => response.json());
  }


  save(collection) {
    return this.http.fetch('/collection', {
      method: 'POST',
      body: JSON.stringify(collection),
      headers: {
        'Content-Type': 'application/json'
        // More options
      }
    }).then((response) => response.json());
  }

  saveUserGroup(userGroup) {
    return this.http.fetch('/organization/create', {
      method: 'POST',
      body: JSON.stringify(userGroup),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => response.json());
  }

  updateUserGroup(id, group) {
    return this.http.fetch(`/group/${id}`, {
      method: 'PUT',
      body: json(group)
    }).then(checkStatus).then((response) => response.json());
  }

  importEuropeanaCollection(collectionID, limit, collectionName) {
    return this.http.fetch('/collection/importEuropeanaCollection?' + 'id=' + collectionID + '&collectionName=' + collectionName +
      ((limit === undefined || limit === null) ? '' : ('&limit=' + limit)), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // More options
      }
    }).then((response) => response.json());
  }

  importEuropeanaSearch(query) {
    return this.http.fetch('/collection/importSearch', {
      method: 'POST',
      body: JSON.stringify(query),
      headers: {
        'Content-Type': 'application/json'
        // More options
      }
    }).then((response) => response.json());
  }

  importEuropeanaGallery(galleryId, galleryName) {
    return this.http.fetch(`/collection/importGallery?userGalleryId=${galleryId}&collectionName=${galleryName}`, {
      method: 'POST'
    });
  }

  importEuropeanaItems(body) {
    return this.http.fetch('/collection/importItems', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  update(id, collection) {
    return this.http.fetch('/collection/' + id, {
      method: 'PUT',
      body: json(collection)
    }).then(checkStatus);
  }

  addRecord(record, collectionId, noDouble) {
    console.log(record.data);
    return this.http.fetch('/collection/' + collectionId + '/addRecord?noDouble=' + noDouble, {
      method: 'POST',
      body: JSON.stringify(record.data),
      headers: {
        'Content-Type': 'application/json'
        // More options
      }
    }).then((response) => response.json());
  }


  swapRecords(collectionId, recordId, oldPosition, newPosition) {
    return this.http.fetch('/collection/' + collectionId + '/moveRecord' + '?recordId=' + recordId + '&oldPosition=' + oldPosition + '&newPosition=' + newPosition, {
      method: 'PUT'
    }).then(checkStatus);
  }

  removeRecord(recordId, collectionId) {
    return this.http.fetch('/collection/' + collectionId + '/removeRecord?' + $.param({
      recId: recordId,
      all: false
    }), {
      method: 'DELETE'
      /*body: JSON.stringify(record.data),
      headers: {
        'Content-Type': 'application/json'
        // More options
      }*/
    }).then(checkStatus);
  }

  addRecordToPosition(record, collectionId, position) {
    return this.http.fetch('/collection/' + collectionId + '/addRecord?position=' + position, {
      method: 'POST',
      body: JSON.stringify(record.data),
      headers: {
        'Content-Type': 'application/json'
        // More options
      }
    }).then(checkStatus);
  }

  setPublicState(collectionId, state) {
    return this.http.fetch('/rights/' + collectionId + '?isPublic=' + state, {
      method: 'GET'
    }).then((response) => response.json());
  }

  getUsersAccess(collectionId) {
    return this.http.fetch('/collection/' + collectionId + '/listUsers', {
      method: 'GET'
    }).then((response) => response.json());
  }

  shareCollection(collectionId, username, rights) {
    return this.http.fetch(`/rights/${collectionId}/${rights}?username=${username}&membersDowngrade=true`, {
      method: 'GET'
    }).then(checkStatus);
  }

  deleteRecordFromPosition(record, collectionId, position) {
    return this.http.fetch('/collection/' + collectionId + '/removeRecord?recId=' + record.dbId + '&position=' + position, {
      method: 'DELETE'
    }).then(checkStatus);
  }

  // Collection deletion
  delete(id) {
    return this.http.fetch('/collection/' + id, {
      method: 'DELETE'
    }).then(checkStatus);
  }

  getAnnotationSummary(colId, mode, userOnly) {
    return this.http.fetch(`/collection/${colId}/annotationSummary?mode=${mode}&userOnly=${userOnly}`, {
      method: 'GET'
    }).then(checkStatus).then((response) => {
      return response.json();
    });
  }
}
