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


/* eslint-disable */
'use strict';
import { LogManager } from 'aurelia-framework';

let imagesLoaded = require('imagesloaded');
let bridget = require('jquery-bridget');

imagesLoaded.makeJQueryPlugin($);

let logger = LogManager.getLogger('Plugin.js');

let settings = $.extend({
	// page
	page: 'default',

	// mobile
	mobile: false,

	// mobile menu
	mobileTrigger: '.mobile-trigger',
	transDuration : 0
});

// moblie
if ($(window).width() < 767) {
	settings.mobile = true;
}

export function getSettings(){
	return settings;
}

export function setMap() {

	if( $( '#maps' ).length > 0 ) {
		logger.info('plugins.js / setMap');

		 new google.maps.Map(document.getElementById('maps'), {
			center: {lat: 52.370216, lng: 4.895168},
			zoom: 3,
			scrollwheel: false,
			styles: [{"featureType":"all","elementType":"geometry.fill","stylers":[{"weight":"2.00"}]},{"featureType":"all","elementType":"geometry.stroke","stylers":[{"color":"#9c9c9c"}]},{"featureType":"all","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#eeeeee"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#7b7b7b"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#c8d7d4"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#070707"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]}],
		});
	}

}


export function initMobileMenu(){

	// check
	if( $( '[data-target]' ).length > 0 ) {

		// on click
		$( '[data-target]' ).on( 'click', function( e ){

			// prevent
			e.preventDefault();

			//
			var target = $( this ).attr( 'data-target' );

			// set
			$( target ).toggleClass( 'active' );
		});
	}
};

export function toggleMore(container) {
	const $closedHeight = 200;
	const $minDiff = 200;
	var $element = $(container);
	var $toggle = $element.parent().find(".show-more");
	if ($element.hasClass("closed")) {
		// must open
		$element.css("height", "auto");
		$height = $element.height();
		$element.css("height", $closedHeight + "px");
		$element.css("height", $height + "px");
		$toggle.removeClass("fa-chevron-down").addClass("fa-chevron-up");
		$element.toggleClass("closed");
	} else {
		// must close
		var $height = $element.height();
		if ($height - $closedHeight >= $minDiff) {
			$element.css("height", $height + "px");
			$element.css("height", $closedHeight + "px");
			$toggle.removeClass("fa-chevron-up").addClass("fa-chevron-down");
			$element.toggleClass("closed");
		} else {
			$toggle.remove();
		}
	}
}
