(function () {
	try {
		$.fn.jquery;
	} catch (e) {
		throw "jQuery is required for Appify to work";
	}

	var isMiddlewareCall = function (args) {
		return args.length === 1 && 'function' === typeof args[0];
	};

	var Appify = function (appCallback) { 
		var appStart = function () {
			var routes = {};
			var routeMiddleware = [];

			var renderers = {};
			var rendererMiddleware = [];

			var route = function (name, callback) {
				if (isMiddlewareCall(arguments)) {
					routeMiddleware.push(arguments[0]);
				} else if (arguments.length === 2) {
					routes[name] = callback;
				} else {
					throw 'Unrecognized call signature for app.route';
				}
			};

			var renderer = function (name, callback) {
				if (isMiddlewareCall(arguments)) {
					rendererMiddleware.push(arguments[0]);
				} else if (arguments.length === 2) {
					renderers[name] = callback;
				} else {
					throw 'Unrecognized call signature for app.renderer';
				}
			};

			var render = function (rendererName, details) {
				var renderer = renderers[rendererName];
				if (!renderer) {
					throw "No handler provided for renderer: " + rendererName;
				}

				var current = 0;
				var $outlet = function (updatedDetails) {
					var middleware = rendererMiddleware[current];
					current += 1;

					if (middleware) {
						return middleware($outlet, updatedDetails);
					} else {
						return renderer(updatedDetails);
					}
				};

				var viewTree = $outlet(details);
				console.log('rendering complete', viewTree);
			};

			var transitionTo = function (routeName, details) {
				var routeHandler = routes[routeName];
				if (!routeHandler) {
					throw "No handler provided for route: " + routeName;
				}

				var current = 0;
				var next = function (updatedDetails) {
					var middleware = routeMiddleware[current];
					current += 1;

					if (middleware) {
						middleware(next, updatedDetails);
					} else {
						routeHandler(render, updatedDetails);
					}
				};

				next(details);
			};

			var app = {
				route: route,
				renderer: renderer,
				transitionTo: transitionTo
			};

			appCallback(app);

			app.transitionTo('index');
		};

		if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
			$(document).on('deviceready', appstart);
		} else {
			$(document).ready(appStart);
		}
	};

	var elementShill = {
		'on': function () {
			return this;
		},
		'class': function () {
			return this;
		}
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