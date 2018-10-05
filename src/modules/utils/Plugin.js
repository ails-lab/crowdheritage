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
//let Masonry = require('masonry-layout');
let Isotope = require('isotope-layout');
//require('masonry-layout');
let imagesLoaded = require('imagesloaded');
let bridget = require('jquery-bridget');

//$.bridget('masonry', Masonry);
$.bridget('isotope', Isotope);
imagesLoaded.makeJQueryPlugin($);

let logger = LogManager.getLogger('Plugin.js');

let settings = $.extend({
	// page
	page: 'default',

	// masonry
	mSelector: '.isotoped',
	mItem: '.entry',
	mSizer: '.sizer',

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

export function isotopeClear(container) {
/*	this is not needed
	let $container = $(container);
	let $elements = $container.isotope('getItemElements');
	$container.isotope('remove', $elements).isotope('layout');
	*/
}

export function isotopeImagesReveal(container, $items) {
	let $container = $(container);
	let iso = $container.data('isotope');

	let itemSelector = settings.mItem;

	// append to container
	$container.append($items);
	// hide by default
	$items.hide();
	$items.imagesLoaded().progress(function(imgLoad, image) {
		let result = image.isLoaded ? 'loaded' : 'broken';
		if(result=='broken'){
			$(image.img).attr('src','/img/assets/images/no_image.jpg')	;
		}
		// get item
		let $item = $(image.img).parents(itemSelector);
		// un-hide item
		$item.show();
		if (iso) {
			iso.appended($item);
		} else {
			return false;
			$.error('iso gone');
		}
	});

	return this;
}

export function initAureliaIsotope(container) {
	logger.info('plugins.js / initAureliaIsotope');
	$(container).isotope({
		itemSelector: settings.mItem,
		transitionDuration: settings.transDuration,
		masonry: {
			columnWidth: settings.mSizer,
			percentPosition: true
		}
	});

}

export function isoRelay(){

	if( $( '[data-grid="isotope" ]' ).length > 0 ) {

		$( '[data-grid="isotope" ]' ).isotope({
			itemSelector: settings.mItem,
			transitionDuration: settings.transDuration,
			masonry: {
				columnWidth: settings.mSizer,
				percentPosition: true
			}
		}).imagesLoaded( function() {
		    // trigger again after images have loaded
			$( '[data-grid="isotope" ]' ).isotope('layout');

		  });

}
}


export function aureliaIsoImagesLoaded(container, $items,parent) {
   logger.info('plugin.js / aureliaIsoImagesLoaded');
   let $container = $(container);

	let iso = $container.data('isotope');
	if(!iso){
		$container=$( '[data-grid="isotope" ]' );
		$container.isotope({
			itemSelector: settings.mItem,
			transitionDuration: settings.transDuration,
			masonry: {
				columnWidth: settings.mSizer,
				percentPosition: true
			}
		});

		iso=$( '[data-grid="isotope" ]' ).data('isotope');

	}

	let itemSelector = settings.mItem;

	//$items.hide();
	$items.imagesLoaded().progress((imgLoad, image) => {
	parent.loading=true;
	  if(image.img.className.indexOf('isoimage')>-1){
		let result = image.isLoaded ? 'loaded' : 'broken';
		if (result === 'broken') {
			$(image.img).attr('src', '/img/assets/img/ui/ic-noimage.png');
		}

		let $item = $(image.img).parents(itemSelector);
		if($item.hasClass('isoload')){
		    $item.removeClass('isoload');
			$item.show();
			if (iso) {
				iso.appended($item);
				$container.isotope('layout');
			}
			else{
				parent.loading=false;
				return false;
			}}
		}
	}).always(function(){

	   parent.loading=false;
	})
}



export function filterIsotope(container, $filter) {
	logger.info(`plugin.js / filterIsotope: ${$filter}`);

	let $container = $(container);
	let iso = $container.data('isotope');
	iso.arrange({
		filter: $filter
	});
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
	var $element = $(container);
	var $toggle = $element.parent().find(".show-more");
	if ($element.hasClass("closed")) {
		// must open
		$element.css("height", "auto");
		$height = $element.height();
		$element.css("height", "200px");
		$element.css("height", $height + "px");
		$toggle.removeClass("fa-chevron-down").addClass("fa-chevron-up");
	} else {
		// must close
		var $height = $element.height();
		$element.css("height", $height + "px");
		$element.css("height", "200px");
		$toggle.removeClass("fa-chevron-up").addClass("fa-chevron-down");
	}
	$element.toggleClass("closed");
}

// Method to initialize isotope
// Dependency: js/vendor/isotope/
export function initIsotope(container) {
	logger.info('plugins.js / initIsotope');
	$(container).isotope({
		itemSelector: settings.mItem,
		transitionDuration: settings.transDuration,
		masonry: {
			columnWidth: settings.mSizer,
			percentPosition: true
		}
	});

	// init filter
	if ($('.filter').length > 0) {
		// get list
		$('.filter .nav li').each(function() {
			// list
			let $list = $(this);
			let data = $list.attr('data-filter');

			// on click
			$('a', this).on('click', function(e) {
				// prevent
				e.preventDefault();

				// filter
				$(settings.mSelector).isotope({
					filter: data
				});

				// reset
				$('.filter .nav li').removeClass('active');
				$list.addClass('active');
			});
		});
	}
	}
