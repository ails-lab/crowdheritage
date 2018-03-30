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


import { inject } from 'aurelia-dependency-injection';
import { User } from '../../modules/User';
import { UserServices } from '../../modules/UserServices';
import { Campaign } from '../../modules/Campaign.js';
import { CampaignServices } from '../../modules/CampaignServices.js';
import settings from '../../conf/global.config.js';

let COUNT = 5;

@inject(CampaignServices, UserServices)
export class Graph {

  constructor(campaignServices, userServices) {
    this.campaignServices = campaignServices;
    this.userServices = userServices;

    this.points = [];
    this.topUsers = [];
    this.offset = 0;
    this.loading = false;
    this.more = true;
  }

  activate(params) {
    this.campaign = params.campaign;
    this.points = params.points;
  }

	attached() {
			if( $( '#mychart' ).length > 0 ) {
				var ctx = $("#mychart");
				new Chart(ctx,{
					"type":"line",
					"data":{
						"labels":["11 JAN","12 JAN","13 JAN","14 JAN","15 JAN" ],
						"datasets":[{
							"label":"","data":[65,59,80,81,56],
							"fill":false,
							"borderColor":"rgb(255, 255, 255)",
							"lineTension":0,
							"pointBackgroundColor": "#fff",
							"pointBorderColor":"#fff",
							"pointRadius" : 5,
							"pointHoverBackgroundColor" : "#fac000",
							"pointHoverBorderColor" : "#fff",
							"pointHoverRadius" : 7,
							"pointHoverBorderWidth" : 2

							}]
						},
					"options":{
						tooltips: {
										backgroundColor:'#fac000',
										cornerRadius : 0,
										bodyFontFamily:'PT Sans',
										titleFontSize : 0,
										displayColors : false,
										titleSpacing : 0,
										yPadding : 10,
										titleMarginBottom : 0
								},
						layout: {
										padding: {
												left: 15,
												right: 15,
												top: 15,
												bottom: 15
										}
								},
								legend: {
										display: false
								},
								scales: {
							xAxes: [
								{
									display: true,
									gridLines: {
										display: true,
										color: "#0fe4b2"
									},
									ticks: {
															fontColor: '#ffffff',
															fontFamily:'PT Sans'
													}
								}
							],
							yAxes: [
								{
									display: true,
									gridLines: {
										display: true,
										color: "#0fe4b2"
									},
									ticks: {
															fontColor: '#ffffff',
															fontFamily:'PT Sans'
													}
								}
							],

						}
					} });
			}
		}
}
