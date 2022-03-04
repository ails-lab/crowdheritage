import { inject } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import fetchConfig from 'fetch.config.js';
import { checkStatus } from 'fetch.config.js';

import 'isomorphic-fetch';

@inject(HttpClient)
export class GroupServices {

  constructor(http) {
    http.configure(fetchConfig);
    this.http = http;
  }

  // Spaces retrieval
  getSpaces(offset, count, prefix = '*') {
    return this.http.fetch(`/group/list?offset=${offset}&count=${count}&prefix=${prefix}&groupType=Project`, {
      method: 'GET'
    }).then(checkStatus).then((response) => response.json());
  }

  // Groups retrieval
  getGroups(offset, count, prefix = '*') {
    return this.http.fetch(`/group/list?offset=${offset}&count=${count}&belongsOnly=true&prefix=${prefix}`, {
      method: 'GET'
    }).then((response) => response.json());
  }

  // Organizations retrieval
  getOrganizations(offset, count, prefix = '*') {
    return this.http.fetch(`/group/list?offset=${offset}&count=${count}&groupType=Organization&belongsOnly=true&prefix=${prefix}`, {
      method: 'GET'
    }).then((response) => response.json());
  }

  getGroup(id) {
    return this.http.fetch(`/group/${id}`, {
      method: 'GET'
    }).then(checkStatus).then((response) => response.json());
  }

  //http://with.image.ntua.gr/collection/list?offset=0&count=20&collectionHits=true&directlyAccessedByUserOrGroup=[{"group":"soundspace","rights":"READ"}]
  getGroupCollections(offset, count, groupName, access = 'READ', collectionHits = true) {
    return this.http.fetch(`/collection/list?offset=${offset}&count=${count}&collectionHits=${collectionHits}&directlyAccessedByUserOrGroup=[{"group":"${groupName}","rights":"${access}"}]`, {
      method: 'GET'
    }).then(checkStatus).then((response) => response.json());
  }

  update(id, group) {
    return this.http.fetch(`/group/${id}`, {
      method: 'PUT',
      body: json(group)
    }).then(checkStatus).then((response) => response.json());
  }

  newGroup(group, groupType) {
    let grouptypeName = groupType.value;
    return this.http.fetch(`/${grouptypeName}/create`, {
      method: 'POST',
      body: json(group)
    }).then(checkStatus).then((response) => response.json());
  }

  newOrganization(group) {
    return this.http.fetch('/organization/create', {
      method: 'POST',
      body: json(group)
    }).then(checkStatus).then((response) => response.json());
  }

  newProject(group) {
    return this.http.fetch('/project/create', {
      method: 'POST',
      body: json(group)
    }).then(checkStatus).then((response) => response.json());
  }

  delete(id) {
    return this.http.fetch(`/group/${id}`, {
      method: 'DELETE'
    }).then(checkStatus).then((response) => response.json());
  }

  listGroupNames(prefix) {
    return this.http.fetch(`/user/listNames?onlyParents=false&forUsers=false&forGroupType=UserGroup&prefix=${prefix}`, {
      method: 'GET'
    }).then(checkStatus)
      .then((response) => response.json());
  }

  getGroupMembers(id) {
    return this.http.fetch(`/group/membersInfo/${id}?category=both`, {
      method: 'GET'
    }).then(checkStatus).then((response) => response.json());
  }

  addUserOrGrouptoGroup(id, userid) {
    return this.http.fetch('/group/addUserOrGroup/' + id + '?id=' + userid, {
      method: 'PUT'
    }).then(checkStatus);
    // }).then(checkStatus).then((response) => response.json());
  }


  removeUserOrGroupfromGroup(id, userid) {
    return this.http.fetch('/group/removeUserOrGroup/' + id + '?id=' + userid, {
      method: 'DELETE'
    }).then(checkStatus);
    // }).then(checkStatus).then((response) => response.json());
  }

  addGroupAdmin(groupid, userid) {
    return this.http.fetch('/group/admin/' + groupid + '?id=' + userid, {
      method: 'PUT'
      // }).then(checkStatus).then((response) => response.json());
    }).then(checkStatus);
  }

  removeGroupAdmin(groupid, userid) {
    return this.http.fetch('/group/admin/' + groupid + '?id=' + userid, {
      method: 'DELETE'
    }).then(checkStatus);
    // }).then(checkStatus).then((response) => response.json());
  }

  findByGroupNameOrEmail(name) {
    return this.http.fetch('/user/findByUserOrGroupNameOrEmail' + '?userOrGroupNameOrEmail=' + name, {
      method: 'GET'
    }).then(checkStatus).then((response) => response.json());
  }

  getDescentant(id) {
    return this.http.fetch(`/group/descendantOrganizations/${id}?collectionHits=true`, {
      method: 'GET'
    }).then(checkStatus).then((response) => response.json());
  }

  addFeaturedCollection(groupId, collectionId, collectionType) {
    let featuredType = (collectionType === 'COLLECTION') ? 'fCollections' : 'fExhibitions';
    let myMap = { [featuredType]: [collectionId] };
    return this.http.fetch(`/group/${groupId}/addFeatured`, {
      method: 'POST',
      body: JSON.stringify(myMap),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(checkStatus).then((response) => response.json());
  }

  removeFeaturedCollection(groupId, collectionId, collectionType) {
    let featuredType = (collectionType === 'COLLECTION') ? 'fCollections' : 'fExhibitions';
    let myMap = { [featuredType]: [collectionId] };
    return this.http.fetch(`/group/${groupId}/removeFeatured`, {
      method: 'POST',
      body: JSON.stringify(myMap),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(checkStatus).then((response) => response.json());
  }
}
