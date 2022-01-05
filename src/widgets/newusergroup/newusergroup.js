import { inject } from 'aurelia-framework';
import { GroupServices } from '../../modules/GroupServices';
import { UserServices } from '../../modules/UserServices';

@inject(GroupServices, UserServices)
export class Newusergroup {
  constructor(groupServices, userServices) {
		this.groupServices = groupServices;
		this.userServices = userServices;
		this.errors = [];
		this.suggestedNames = [];
		this.suggestedGroupNames = [];
		this.groups = [];
		this.members = [];
		this.users = [];
	}

	get suggestionsActive() { return this.suggestedNames.length !== 0; }
	get gsuggestionsActive() { return this.suggestedGroupNames.length !== 0; }

	prefixChanged(newValue, oldValue) {
		if (newValue === '') {
			this.suggestedNames = [];
			return;
		}
		this.getSuggestedNames(newValue);
		$('#usersuggestions').show();
	}

	gprefixChanged(newValue, oldValue) {
		if (newValue === '') {
			this.suggestedGroupNames = [];
			return;
		}
		this.getSuggestedGroupNames(newValue);
		$('#groupsuggestions').show();
	}

	getSuggestedNames(prefix) {
		this.suggestedNames = [];
		this.userServices.listUserNames(prefix).then((res) => {
			this.suggestedNames = res.slice(0, 8);
		});
	}

	domouseover(index) {
		$('#' + index).addClass('autocomplete-selected');
	}

	domouseout(index) {
		$('#' + index).removeClass('autocomplete-selected');
	}

	hideuSuggestions() {
		this.prefix = '';
		$('#usersuggestions').hide();
		$('#uinput').val('');
	}

	hidegSuggestions() {
		this.gprefix = '';
		$('#groupsuggestions').hide();
		$('#ginput').val('');
	}

	getSuggestedGroupNames(gprefix) {
		this.suggestedGroupNames = [];
		this.groupServices.listGroupNames(gprefix).then((res) => {
			this.suggestedGroupNames = res.slice(0, 8);
		});
	}


	activate(params) {
		let gid;
    this.edit = params.type === 'edit' ? true : false;
    this.group = this.edit ? params.userGroup : null;
    this.name = this.edit ? this.group.friendlyName : '';
    this.shortName = this.edit ? this.group.username : ''
    this.about = this.edit ? this.group.about : '';
		if (params.userGroup !==null && typeof params.userGroup !== 'undefined' ) {
			gid = params.userGroup.dbId;
			this.group = params.userGroup;
			this.widgetTitle = 'Manage members';
			return this.groupServices.getGroupMembers(gid, 'both')
			.then(response => {
				this.loadmembers(response);
			}).catch(error => {
				console.error(error.message);
				toastr.error('Error creating group members');
			});
		}
	}


	loadmembers(data) {
		this.users = data.users;
		this.groups = data.groups;
    this.sortMembers();
	}

  sortMembers() {
    function compareAccess(a, b) {
      if ( a.admin && !b.admin ){
        return -1;
      }
      if ( !a.admin && b.admin ){
        return 1;
      }
      return 0;
    }
    function compareName(a, b) {
      if ( a.username.toLowerCase() < b.username.toLowerCase() ){
        return -1;
      }
      if ( a.username.toLowerCase() > b.username.toLowerCase() ){
        return 1;
      }
      return 0;
    }

    this.users.sort(compareName).sort(compareAccess);
  }

	addMember( index, type ) {
		let name = '';
		if ( type === 'user' ) {
			name = this.suggestedNames[index].value;
			this.hideuSuggestions();
		} else if ( type === 'group' ) {
			name = this.suggestedGroupNames[index].value;
			this.hidegSuggestions();
		}
		this.groupServices.findByGroupNameOrEmail(name).then(fresponse => {
			let newMember = fresponse;
			this.groupServices.addUserOrGrouptoGroup(this.group.dbId, fresponse.userId).then(response =>{
				if (response.status !== 200) {
					if (response.statusText) {
						throw new Error(response.statusText);
					} else if (response.error) {
						throw new Error(response.error);
					}
				} else {
					let pos = '';
					if (type === 'user') {
						pos = this.users.findIndex(user => (user.username === name));
						if ( pos === -1 ) this.users.push(newMember);
						else throw new Error('Member of the group already');
            this.sortMembers();
					} else if (type === 'group' ) {
						pos = this.groups.findIndex(user => (user.username === name));
						if ( pos === -1 ) this.groups.push(newMember);
						else throw new Error('Member of the group already');
					}
				}
			}).catch(error => {
				console.log(error.message);
				toastr.error('Error : ' + error.message);
			});
		});
	}


	removeMember(name, userid,  type ) {
		this.groupServices.removeUserOrGroupfromGroup(this.group.dbId, userid).then(response => {
			if (response.status !== 200) {
				if (response.statusText) {
					throw new Error(response.statusText);
				} else if (response.error) {
					throw new Error(response.error);
				}
			} else {
				let pos = ' ';
				if (type === 'user') {
					pos = this.users.findIndex(user => (user.username === name));
					this.users.splice(pos, 1);
				} else if (type === 'group' ) 	{
					pos = this.groups.findIndex(user => (user.username === name));
					this.groups.splice(pos, 1);
				}
			}
		}).catch(error => {
			console.log(error.message);
			toastr.error('Error : ' + error.message);
		});
	}

	toggleuseradmin( user ) {
		if (user.admin) {
			this.groupServices.removeGroupAdmin(this.group.dbId, user.userId).then(response => {
				if (response.status !== 200) {
					if (response.statusText) {
						throw new Error(response.statusText);
					} else if (response.error) {
						throw new Error(response.error);
					}
				}else{
					user.admin = false;
				}
			}).catch(error => {
				console.log(error.message);
				toastr.error('Error : ' + error.message);
			});
		} else {
			this.groupServices.addGroupAdmin(this.group.dbId, user.userId).then(response => {
				if (response.status !== 200) {
					if (response.statusText) {
						throw new Error(response.statusText);
					} else if (response.error) {
						throw new Error(response.error);
					}
				}else{
					user.admin  = true;
				}
			}).catch(error => {
				console.log(error.message);
				toastr.error('Error : '  + error.message);
			});
		}
	}

	attached() {
		$('.action').removeClass('active');
	}

	closeTab() {
		$('.action').removeClass('active');
	}

  closeNav() {
    this.name = this.edit ? this.group.friendlyName : '';
    this.shortName = this.edit ? this.group.username : '';
    this.about = this.edit ? this.group.about : '';
    document.getElementById("newUserGroupSidebar").style.width = "0";
    document.getElementById("newUserGroupSidebar").style.boxShadow = "none"
  }

}
