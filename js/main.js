$(function () { // wait for document ready
	// scrollmagic init
	var controller = new ScrollMagic.Controller();
	// define movement of panels
	// var wipeAnimation = new TimelineMax()
	// 	.fromTo("div.map.turqoise", 1, { x: "-100%" }, { x: "0%", ease: Linear.easeNone })  // in from left
	// 	.fromTo("div.map.green", 1, { x: "100%" }, { x: "0%", ease: Linear.easeNone })  // in from right
	// 	.fromTo("div.map.bordeaux", 1, { y: "-100%" }, { y: "0%", ease: Linear.easeNone }); // in from top

	// create scene to pin and link animation
	var scene = new ScrollMagic.Scene({
		triggerElement: "#stop_1"
	})
	.setClassToggle('#stop_1 .journey-stop__content', 'fade-in')
	// .addIndicators({
	// 	name: 'fade city1'
	// })
	.addTo(controller);

	// create scene to pin and link animation
	var scene = new ScrollMagic.Scene({
		triggerElement: "#stop_2"
	})
	.setClassToggle('#stop_2 .journey-stop__content', 'fade-in')
	// .addIndicators({
	// 	name: 'fade city2'
	// })
	.addTo(controller);

	function lockOrientation(orientation) {
		console.log("locking orientaiton..");
		if ("orientation" in window.screen) {
			var lockFunction = window.screen.orientation.lock;

			if (lockFunction.call(window.screen.orientation, orientation)) {
				console.log('Orientation locked in: ' + orientation)
			} else {
				console.error('There was a problem in locking the orientation')
			}
			console.log("screen is: " + window.screen.orientation.type);
		}
	}

	/* Fullscreen video trigger */
	function openFullscreen(video_element) {
		console.log("opening vid")
		var elem = video_element
		console.log(elem)
		if (elem.paused) {
			if (elem.requestFullscreen) {
				elem.requestFullscreen();
				lockOrientation("landscape");
			} else if (elem.mozRequestFullScreen) { /* Firefox */
				elem.mozRequestFullScreen();
				lockOrientation("landscape");
			} else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
				elem.webkitRequestFullscreen();
				lockOrientation("landscape");
			} else if (elem.msRequestFullscreen) { /* IE/Edge */
				elem.msRequestFullscreen();
				lockOrientation("landscape");
			}
			elem.play();
		} else {
			elem.pause();
		}
	}


	/* TiltJS */
	const tilt = document.querySelector('.this-tilts');
	VanillaTilt.init(tilt,{
		max: 5,
		// scale: 1.025,
		reset: true
	});

	// $('.this-tilts').tilt({
	// 	maxTilt: 10,
	// 	perspective: 1000,   // Transform perspective, the lower the more extreme the tilt gets.
	// 	easing: "cubic-bezier(.03,.98,.52,.99)",    // Easing on enter/exit.
	// 	// scale: 1.01,      // 2 = 200%, 1.5 = 150%, etc..
	// 	speed: 300,    // Speed of the enter/exit transition.
	// 	transition: false,   // Set a transition on enter/exit.
	// 	disableAxis: null,   // What axis should be disabled. Can be X or Y.
	// 	reset: false,   // If the tilt effect has to be reset on exit.
	// 	// glare: false,  // Enables glare effect
	// 	// maxGlare: 0.3       // From 0 - 1.
	// })


	/* Window Panning calculations - TODO: functionize */
	var initial_offset_bottom = $('#travel_1 .travel-map__content').innerHeight() - window.innerHeight;
	var initial_offset_right = $('#travel_1 .travel-map__content').innerWidth() - window.innerWidth;
		var iob = (initial_offset_bottom > 0) ? "-" + initial_offset_bottom + "px" : initial_offset_bottom + "px";
		var ior = (initial_offset_right > 0) ? "-" + initial_offset_right + "px" : initial_offset_right + "px";

	$('#travel_1 .travel-map__content').css({
		bottom: iob,
		right: ior
	});
	/* ********* */

	/* Journey div heights set up for mobile jump fix: */
	$('.journey-travel.travel-map').css({ height: window.innerHeight });

	var $journey_videos = $('.journey-travel.travel-video');
	$journey_videos.each(function(i){
		console.log(i)
		var myVideo = $("video", i)[0];
		var poster = $(myVideo).siblings(".poster");
		// console.log(poster);
		poster.on("click", function() {
			console.log("poster clicked")
			openFullscreen(myVideo);
		})
	});

	/*  FLIGHT MAP-JOURNEY LOGIC:  */
	var $map_journeys = $('.journey-travel.travel-map');
	var $flight_paths = $('.flightprogress.animated');

	$map_journeys.each(function(i) {
		if(i < 1) i = 1

		// $plane_scale_sm = $(this).data('pscale-sm')
		// $plane_scale_lg = $(this).data('pscale-lg')
		$plane_scale_sm = 0.5
		$plane_scale_lg = 1.5

		if (document.getElementById('flight' + i) !== null) {

			/* Snap.js vars: */
			flight = Snap('#flight' + i)
			plane = flight.select('#plane_svg' + i)
			flightPath = flight.select('#flightPath' + i)
			lenPath = Snap.path.getTotalLength(flightPath.attr("d"))
			path0Pos = flightPath.getPointAtLength(0)

			/* Set initial plane pos according to path: */
			plane.attr({
				transform: 't' + [path0Pos.x + 25, path0Pos.y] +
					'r' + (path0Pos.alpha - 180) +
					's' + $plane_scale_sm
			});

			var the_map = $(this);
			var the_pilot = the_map.children(".pilot");
			var pilotTransition = 300;

			animateMap = function(map) {
				setTimeout(function(){
					console.log('animating map');
					to_animate = $(map).find('.travel-map__content, .travel-map__content .flightprogress, .plane travel-map__content g.plane-body > path');
					to_animate.css("animation-play-state", "running");
					to_animate.addClass('anim-plane-height')

					Snap.animate(0, lenPath, function (val) {
						var pos = flightPath.getPointAtLength(val)
						var stupid_offset = 25
						plane.attr({
							transform: 't' + [pos.x + stupid_offset, pos.y] +
								'r' + (pos.alpha - 180) +
								's' + scalePlane(lenPath, val, $plane_scale_sm, $plane_scale_lg)
						});
					}, 4000, mina.easeinout)
				}, pilotTransition)
			}

			closePilot = function(pilot) {
				$(pilot).fadeOut(pilotTransition);
			}


			$(this).on("click", ".map_launch", function() {
				closePilot(the_pilot);
				animateMap(the_map);
			})

		}

		i++;
	})

	$flight_paths.each(function() {
		//console.log($(this));
		$(this).bind({
			animationend: function() {
				city_marker = $(this).siblings('.next-stop');
				city_marker.addClass('arrived');
			},
			click: function() {
				console.log('clicked')
			}
		});
	})

	function scalePlane(max, val, min_scale, max_scale) {
		third = Math.round(max / 3)
		percentage = Math.round(val / max * 100)
		if (percentage <= 33) {
			scale_percentage = Math.round((val / third) * 100)
		} else if (percentage > 33 && percentage < 66) {
			scale_percentage = 100
		} else {
			scale_percentage = Math.round(((max - val) / third) * 100)
		}
		scale_increment = (max_scale - min_scale) / 100
		scale = Math.max(min_scale, (min_scale + (scale_increment * scale_percentage)))
		// console.log(percentage + '%', scale_percentage)
		return scale
	}

});
