(function () {
	try {
		$.fn.jquery;
	} catch (e) {
		throw "jQuery is required for Appify to work";
	}

	var Appify = function (appCallback) { 
		var appStart = function () {
			var app = {
				route: function () {},
				renderer: function () {}
			};

			appCallback(app);
		};

		if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
			$(document).on('deviceready', appstart);
		} else {
			$(document).ready(appStart);
		}
	};

	var elementShill = {
		'on': function () {},
		'class': function () {}
	};

	Appify.templates = {
		$div: function() {
			return elementShill;
		},
		$a: function () {
			return elementShill;
		}
	}

	window.Appify = Appify;

}());