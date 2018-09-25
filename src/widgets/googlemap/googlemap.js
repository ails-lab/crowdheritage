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


import {inject} from 'aurelia-framework';
import mapsapi from 'google-maps-api';
import { EventAggregator } from 'aurelia-event-aggregator';


@inject(mapsapi('AIzaSyD4SpqL2DlfdiKJquVUmPnxPqFu56hChK8'),EventAggregator)

export class Googlemap{
  constructor(mapsapi,eventAggregator) {
	 this.ea = eventAggregator;
	     
     this.mapsLoadingPromise = mapsapi.then(maps =>{
       this.maps = maps;
     })
     var geocoder, map;
     this.data=[];
     this.markers=[];
     this.evgeotag = this.ea.subscribe('geotag-created', () => { this.codeLocations()});
 	
  }

  activate(model) {
      this.data = model;
    }
  
  attached() {
      this.mapsLoadingPromise.then(() =>{
          this.map=new this.maps.Map(document.getElementById('map'), {
             center: {lat: 52.370216, lng: 4.895168},
     		 zoom: 3,
			 scrollwheel: false,
			 styles: [{"featureType":"all","elementType":"geometry.fill","stylers":[{"weight":"2.00"}]},{"featureType":"all","elementType":"geometry.stroke","stylers":[{"color":"#9c9c9c"}]},{"featureType":"all","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#eeeeee"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#7b7b7b"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#c8d7d4"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#070707"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]}],
			 
          });
          this.geocoder = new this.maps.Geocoder();
          this.codeLocations();
    });
  }
  
  codeLocations() {
	  var self=this;
	  self.clearMarkers();
	  for (var i = 0; i < this.data.length; i++) {
      	  var address = this.data[i];
      	  
         this.geocoder.geocode({ 'address': address }, function(results, status) {
          if (status === "OK") {
         // map.setCenter(results[0].geometry.location);
          var marker = new self.maps.Marker({
              map: self.map,
              position: results[0].geometry.location
          });
          self.markers.push(marker);
        } else {
          console.log("Geocode unsuccessful for:"+address);
        }
      });
         
    }
  }
  
  clearMarkers(){
	  for (var i = 0; i < this.markers.length; i++) {
	     this.markers[i].setMap(null);
	  }
	  
  }
  
}