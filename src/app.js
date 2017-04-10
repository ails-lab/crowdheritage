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
      { route: [''],     name: 'index',   moduleId: './campaignIndex',   nav: true,  title: 'WITHcrowd' },
      { route: ['/:id'], name: 'summary', moduleId: './campaignSummary', nav: false, title: '' },
      { route: 'item',   name: 'item',    moduleId: './campaignItem',    nav: false, title: 'Annotate' }
    ]);

    this.router = router;
  }

  goToCamp(camp, user) {
    let summary = this.router.routes.find(x => x.name === 'summary');
    summary.campaign = camp;
    this.router.navigateToRoute('summary', {id: camp.dbId});
  }
}

class PostCompleteStep {
  run(routingContext, next) {
      window.scrollTo(0,0);

      return next();
  }
}
