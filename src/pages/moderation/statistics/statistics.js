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


import { inject, LogManager } from 'aurelia-framework';
import { CampaignServices } from 'CampaignServices.js';
import { Router } from 'aurelia-router';


let logger = LogManager.getLogger('Statistics.js');

@inject(Router, CampaignServices)
export class Statistics {

	constructor(router, campaignServices) {
    this.router = router
		this.campaignServices = campaignServices;
    this.router = router;

    this.cname = '';
		this.loading = false;
		this.statistics = [];
		this.countChartData = {
			labels: [],
			datasets: [{
				label: 'Items',
				data: [],
				backgroundColor: []
			}]
		};
		this.dateChartData = {
			labels: [],
			datasets: [{
				label: 'Annotations',
				data: [],
				backgroundColor: []
			}]
		};
	}

	get currentLocale() { return window.location.href.split('/')[3]; }

	get randomColor() {
	  var letters = '0123456789ABCDEF'.split('');
	  var color = '#';
	  for (var i = 0; i < 6; i++) {
	    color += letters[Math.floor(Math.random() * 16)];
	  }
	  return color;
	}

	getPercentage(a, b) {
		return (100 * a / b).toFixed(2);
	}

	activate(params) {
		this.loading = true;
    this.cname = params.campaign.username;

		this.campaignServices.getCampaignStatistics(this.cname)
			.then(response => {
				for (const key in response) {
					this.statistics[key] = response[key];
				}
				this.statistics.push({'key': 'Campaign', 'value': response["campaign"]});
				this.statistics.push({'key': 'Contributors', 'value': response["contributors"]});
				this.statistics.push({'key': 'Collections', 'value': response["collections"]});
				this.statistics.push({'key': 'Items', 'value': response["items-total"]});
				this.statistics.push({'key': 'Annotations', 'value': response["annotations-total"]});
				this.statistics.push({'key': 'Total annotation upvotes', 'value': response["upvotes"]});
				this.statistics.push({'key': 'Total annotation downvotes', 'value': response["downvotes"]});

				let countData = response["annotation-count-frequency"];
				for (const key in countData) {
					this.countChartData.labels.push(key + ' annotations');
					this.countChartData.datasets[0].data.push(countData[key]);
					this.countChartData.datasets[0].backgroundColor.push(this.randomColor);
				}
				let dateData = response["annotation-date-frequency"];
				for (const key in dateData) {
					this.dateChartData.labels.push(key);
					this.dateChartData.datasets[0].data.push(dateData[key]);
					this.dateChartData.datasets[0].backgroundColor.push(this.randomColor);
				}

				var countChart = $("#countChart");
				new Chart(countChart, {
				  "type": "bar",
				  "data": this.countChartData,
					"options": {
						responsive: true,
						maintainAspectRatio: false,
				    scales: {
				      y: {
				        beginAtZero: true
				      }
				    }
					}
				});
				var dateChart = $("#dateChart");
				new Chart(dateChart, {
				  "type": "line",
				  "data": this.dateChartData,
					"options": {
						responsive: true,
						maintainAspectRatio: false,
				    scales: {
				      y: {
				        beginAtZero: true
				      }
				    }
				  }
				});
				var annotatedChart = $("#annotatedChart");
				new Chart(annotatedChart, {
					"type": "pie",
					"data": {
						labels: ['Items annotated', 'Items not annotated'],
						datasets: [{
							label: 'Annotated items',
							data: [response["items-annotated"], response["items-total"] - response["items-annotated"]],
							backgroundColor: ['rgb(71, 179, 156)', 'rgb(236, 107, 86)'],
							hoverOffset: 4
						}]
					},
					"options": {
						responsive: true,
						maintainAspectRatio: false
					}
				});
				var publishChart = $("#publishChart");
				new Chart(publishChart, {
					"type": "doughnut",
					"data": {
						labels: ['Annotations for publish', 'Annotations discarded'],
						datasets: [{
							label: 'Items for publish',
							data: [response["annotations-accepted"], response["annotations-rejected"]],
							backgroundColor: ['rgb(60, 157, 78)', 'rgb(201, 77, 109)'],
							hoverOffset: 4
						}]
					},
					"options": {
						responsive: true,
						maintainAspectRatio: false
					}
				});

				this.loading = false;
			})
	}

	attached() {
    $('.accountmenu').removeClass('active');
  }

}
