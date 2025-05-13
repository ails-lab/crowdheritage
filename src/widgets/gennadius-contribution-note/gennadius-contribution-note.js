@inject(I18N)
export class GennadiusContributionNote {
  static inject = [I18N];

  constructor(i18n) {
    this.i18n = i18n;
  }
}
