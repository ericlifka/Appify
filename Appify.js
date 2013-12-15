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
			var renderMiddleware = [];

			var route = function (name, callback) {
				if (isMiddlewareCall(arguments)) {
					routeMiddleware.push(arguments[0]);
				} else if (arguments.length === 2) {
					routes[name] = callback;
				} else {
					throw 'Unrecognized call signature for route';
				}
			};

			var render = function (name, callback) {
				if (isMiddlewareCall(arguments)) {
					renderMiddleware.push(arguments[0]);
				} else if (arguments.length === 2) {
					renderers[name] = callback;
				} else {
					throw 'Unrecognized call signature for render';
				}
			};

			var renderer = function (name, details) {
				var renderHandler = renderers[name];
				if (!renderHandler) {
					throw "No handler provided for renderer: " + name;
				}

				var current = 0;
				var $outlet = function (updatedDetails) {
					var middleware = renderMiddleware[current];
					current += 1;

					if (middleware) {
						return middleware($outlet, updatedDetails);
					} else {
						return renderHandler(updatedDetails);
					}
				};

				var viewTree = $outlet(details);
				debugger;
				console.log('rendering complete', viewTree);
			};

			var transition = function (routeName, details) {
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
						routeHandler(renderer, updatedDetails);
					}
				};

				next(details);
			};

			appCallback(route, render, transition);

			transition('index');
		};

		if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
			$(document).on('deviceready', appstart);
		} else {
			$(document).ready(appStart);
		}
	};

	// Templating
	var HtmlElement = function () {
		if (window === this) {
			throw "HtmlElement constructor called without 'new' keyword";
		}

		this.children = [];
		this.attributes = {};
		this.events = {};
	};
	HtmlElement.prototype.on = function (event, handler) {
		if (!this.events[event]) {
			this.events[event] = [];
		}
		this.events[event].push(handler);
		return this;
	};
	HtmlElement.prototype.class = function (/* classNames... */) {
		for (var i = 0, length = arguments.length; i < length; i++) {
			this.attr('class', arguments[i]);
		}
		return this;
	};
	HtmlElement.prototype.attr = function (attr, value) {
		if (!this.attributes[attr]) {
			this.attributes[attr] = value;
		}
		else if ($.isArray(this.attributes[attr])) {
			this.attributes[attr].push(value);
		} else {
			var original = this.attributes[attr];
			this.attributes[attr] = [original, value];
		}
		return this;
	};
	HtmlElement.prototype.tag = function (tag) {
		this.tag = tag;
		return this;
	};
	HtmlElement.prototype.child = function (child) {
		this.children.push(child);
		return this;
	};
	HtmlElement.prototype.children = function (children) {
		for (var i = 0, length = children.length; i < length; i++) {
			this.children.push(children[i]);
		}
		return this;
	};

	var isHtmlElement = function (elem) {
		return elem instanceof HtmlElement;
	};

	var createElem = function (tag, args) {
		var elem = new HtmlElement();
		elem.tag(tag);

		for (var i = 0, length = args.length; i < length; i++) {
			var arg = args[i];
			if (isHtmlElement(arg) || 'string' === typeof arg) {
				elem.child(arg);
			} else {
				for (var attr in arg) {
					if (arg.hasOwnProperty(attr)) {
						elem.attr(attr, arg[attr]);
					}
				}
			}
		}
		return elem;
	};

	var generateTagFunction = function (tag) {
		return function () {
			return createElem(tag, arguments);
		};
	};

	var templates = {
		HtmlElement: HtmlElement,
		generateTagFunction: generateTagFunction,
		$event: function (elem, event, handler) {
			return elem.on(event, handler);
		}
	};

	var tags = ['div', 'a'];
	var length = tags.length;
	for (var i = 0; i < length; i++) {
		(function (tag) {
			templates['$'+tag] = generateTagFunction(tag);
		})(tags[i]);
	}

	Appify.templates = templates;
	window.Appify = Appify;
}());