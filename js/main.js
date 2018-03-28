
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
		initBigMaps();

		// init mobile menu
		initMobileMenu();

		// init chart
		initChart();
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

		// dummy data
		var dummyLocation = [
		{
						'location' : 'Amsterdam',
						'lat'	   : 52.37,
						'long'	   : 4.89,
					},
					{
						'location' : 'Milan',
						'lat'	   : 45.46,
						'long'	   : 9.19,
					}
				];

		// check
		if( $( '#maps' ).length > 0 ) {

			// key
			var map = new google.maps.Map(document.getElementById('maps'), {
				center: {lat: 52.370216, lng: 4.895168},
				zoom: 3,
				scrollwheel: false,
				styles: [{"featureType":"all","elementType":"geometry.fill","stylers":[{"weight":"2.00"}]},{"featureType":"all","elementType":"geometry.stroke","stylers":[{"color":"#9c9c9c"}]},{"featureType":"all","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#eeeeee"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#7b7b7b"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#c8d7d4"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#070707"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]}],
			});

			// marker image
			var image = '../img/ic-marker.png';

			// loop
			$( dummyLocation ).each(function( i ){

				// new marker
				var marker = new google.maps.Marker({
					position: { lat: this.lat, lng: this.long },
					map: map,
					icon: image,
					animation: google.maps.Animation.DROP,
					title: this.location
				});
			});


		}
	};

	// method to init maps
	var initBigMaps = function(){

		// dummy data
		var dummyLocation = [
			{
				'location' : 'Amsterdam',
				'lat'	   : 52.37,
				'long'	   : 4.89,
				'amount'   : '12'
			},
			{
				'location' : 'Milan',
				'lat'	   : 45.46,
				'long'	   : 9.19,
				'amount'   : '120'
			},
			{
				'location' : 'Athens',
				'lat'	   : 37.98,
				'long'	   : 23.72,
				'amount'   : '86'
			}
		];

		// check
		if( $( '#bigmaps' ).length > 0 ) {

			// key
			var map = new google.maps.Map(document.getElementById('bigmaps'), {
				center: {lat: 52.370216, lng: 4.895168},
				zoom: 3,
				scrollwheel: false,
				styles: [{"featureType":"all","elementType":"geometry.fill","stylers":[{"weight":"2.00"}]},{"featureType":"all","elementType":"geometry.stroke","stylers":[{"color":"#9c9c9c"}]},{"featureType":"all","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#eeeeee"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#7b7b7b"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#c8d7d4"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#070707"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]}],
			});

			// marker image
			var image = '../img/ic-marker-full.png';

			// loop
			$( dummyLocation ).each(function( i ){

				// new marker
				var marker = new google.maps.Marker({
					position: { lat: this.lat, lng: this.long },
					map: map,
					icon: image,
					label: {text: this.amount, color: "white", fontSize: '11px'},
					animation: google.maps.Animation.DROP,
					title: this.location
				});
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

	// method to initiate chart
	var initChart = function(){

		// check
		if( $( '#mychart' ).length > 0 ) {

			// set
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
	};
};

// function
function initMap() {
	return null;
}
