
// document ready
$( document ).ready( function(){

	// init ui object
	var UIObject = new EUBlogUI();

	// init
	UIObject.init();
});

// UI interaction class
EUBlogUI = function( custom ){

	// overwrite default settings
	var settings = $.extend({


	},
	custom || {});

	// this
	this.init = function(){

		// init isotope
		initIsotope();

		// init map
		initMaps();

		// init mobile menu
		initMobileMenu();
	};

	// maethod to initiate isotope
	var initIsotope = function(){

		// load
		$( window ).on( 'load', function(){

			// check
			if( $( '.isotoped' ).length > 0 ) {

				// init
				$( '.isotoped' ).isotope({

					// options
					columnWidth		: '.sizer',
					itemSelector	: '.entry',
					percentPosition	: true
				});
			}
		});
	};

	// method to init maps
	var initMaps = function(){

		// check
		if( $( '#maps' ).length > 0 ) {

			// key
			var map = new google.maps.Map(document.getElementById('maps'), {
				center: {lat: 52.370216, lng: 4.895168},
				zoom: 3,
				scrollwheel: false,
				styles: [{"featureType":"all","elementType":"geometry.fill","stylers":[{"weight":"2.00"}]},{"featureType":"all","elementType":"geometry.stroke","stylers":[{"color":"#9c9c9c"}]},{"featureType":"all","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#eeeeee"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#7b7b7b"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#c8d7d4"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#070707"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]}],
			});

		}
	};

	// method to init mobile menu
	var initMobileMenu = function(){

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
};

// function
function initMap() {
	return null;
}
