import { inject } from 'aurelia-framework';


@inject()
export class Newusergroup {


  async activate(params) {
    this.edit = params.type === 'edit' ? true : false;
    this.userGroup = this.edit ? params.userGroup : null;
    this.name = this.edit ? this.userGroup.friendlyName : '';
    this.shortName = this.edit ? this.userGroup.username : ''
    this.about = this.edit ? this.userGroup.about : '';
  }
}
