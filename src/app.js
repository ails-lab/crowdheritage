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


export class App {
  configureRouter(config, router) {
    config.title = '';
    config.addPipelineStep('postcomplete', PostCompleteStep);
    config.options.pushState = true;
    config.options.root = '/';
    config.map([
      { route: ['', ':gname?'],        name: 'index',   moduleId: './pages/index/campaignIndex',     nav: true,  title: 'WITHcrowd' },
      { route: ':gname/:cname',        name: 'summary', moduleId: './pages/summary/campaignSummary', nav: false, title: '' },
      { route: ':gname/:cname/:recid', name: 'item',    moduleId: './pages/item/campaignItem',       nav: false, title: 'Annotate | WITHcrowd' }
    ]);

    this.router = router;
  }

  goToCamp(camp) {
    let summary = this.router.routes.find(x => x.name === 'summary');
    summary.campaign = camp;
    this.router.navigateToRoute('summary', {cname: camp.username, gname: camp.spacename});
  }

  goToItem(camp, col) {
    let item = this.router.routes.find(x => x.name === 'item');
    item.campaign = camp;
    item.collection = col;
    this.router.navigateToRoute('item', {cname: camp.username, gname: camp.spacename, recid: "1234"});
  }
}

class PostCompleteStep {
  run(routingContext, next) {
      window.scrollTo(0,0);

      return next();
  }
}
