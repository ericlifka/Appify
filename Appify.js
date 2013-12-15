(function () {
	try {
		$.fn.jquery;
	} catch (e) {
		throw "jQuery is required for Appify to work";
	}

	var isMiddlewareCall = function (args) {
		return args.length === 1 && 'function' === typeof args[0];
	};

	var escapeQuotes = function (string) {
		return string.replace(/"/gi, '\\"');
	};

	var idCounter = 0;
	var nextUniqueId = function () {
		return "appify" + idCounter++;
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
				document.body.innerHTML = generateHtml(viewTree);
				bindEvents(viewTree);
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


	var HtmlElement = function () {
		if (window === this) {
			throw "HtmlElement constructor called without 'new' keyword";
		}

		this.children = [];
		this.attributes = {};
		this.events = {};
	};
	HtmlElement.prototype = {
		on: function (event, handler) {
			if (!this.events[event]) {
				this.events[event] = [];
			}
			this.events[event].push(handler);
			return this;
		},
		class: function (/* classNames... */) {
			for (var i = 0, length = arguments.length; i < length; i++) {
				this.attr('class', arguments[i]);
			}
			return this;
		},
		attr: function (attr, value) {
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
		},
		tag: function (tag) {
			this.tag = tag;
			return this;
		},
		child: function (child) {
			this.children.push(child);
			return this;
		},
		children: function (children) {
			for (var i = 0, length = children.length; i < length; i++) {
				this.children.push(children[i]);
			}
			return this;
		},
		toString: function () {
			return "[HtmlElement <" + this.tag + ">]";
		},
	};


	// Private HtmlElement helpers
	var isHtmlElement = function (elem) {
		return elem instanceof HtmlElement;
	};

	var hasEvents = function (elem) {
		return Object.keys(elem.events).length > 0;
	};

	var updateElementBeforeRender = function (elem) {
		generateUniqueId(elem);
		addDefaultHref(elem);
	};

	var addDefaultHref = function (elem) {
		if ('a' === elem.tag && !elem.attributes.href) {
			elem.attr('href', '#');
		} 
	};

	var generateUniqueId = function (elem) {
		if (!elem.attributes.id && hasEvents(elem)) {
			elem.attr('id', nextUniqueId());
		}
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

	var generateHtml = function (elem) {
		updateElementBeforeRender(elem);

		var openTag = generateOpenTag(elem);
		var childrenHtml = getChildrenHtml(elem);
		var closeTag = generateCloseTag(elem);

		return openTag + childrenHtml + closeTag;
	};

	var generateOpenTag = function (elem) {
		var tag = "<" + elem.tag;
		for (var attr in elem.attributes) {
			if (elem.attributes.hasOwnProperty(attr)) {
				var value = elem.attributes[attr];
				if ($.isArray(value)) {
					value = value.join(' ');
				}
				tag += ' ' + attr + '="' + escapeQuotes(value) + '"';
			}
		}
		tag += ">";
		return tag;
	};

	var generateCloseTag = function (elem) {
		return "</" + elem.tag + ">";
	};

	var getChildrenHtml = function (elem) {
		var childrenHtml = "";
		for (var i = 0, length = elem.children.length; i < length; i++) {
			var child = elem.children[i];
			if ('string' === typeof child) {
				childrenHtml += child;
			} else if (isHtmlElement(child)) {
				childrenHtml += generateHtml(child);
			} else {
				throw {
					toString: function () { return "Unrecognized child element type"; },
					child: child
				};
			}
		}
		return childrenHtml;
	};

	var bindEvents = function (elem) {
		var i, length;
		var id = elem.attributes.id;
		for (var event in elem.events) {
			if (elem.events.hasOwnProperty(event)) {
				var handlers = elem.events[event];
				for (i = 0, length = handlers.length; i < length; i++) {
					var handler = handlers[i];
					$("#" + id).on(event, handler);
				}
			}
		}

		for (i = 0, length = elem.children.length; i < length; i++) {
			var child = elem.children[i];
			if (isHtmlElement(child)) {
				bindEvents(child);
			}
		}
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

	var tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'b', 'code', 'em', 'i',
				'kbd', 'pre', 'small', 'strong', 'abbr', 'address', 'bdo', 'blockquote',
				'cite', 'del', 'ins', 'sub', 'sup', 'a', 'img', 'div', 'span', 'ul', 'li',
				'ol', 'dl', 'dt', 'dd', 'table', 'tr', 'th', 'td', 'iframe', 'form', 'input',
				'select', 'option', 'textarea'];
	var length = tags.length;
	for (var i = 0; i < length; i++) {
		(function (tag) {
			templates['$'+tag] = generateTagFunction(tag);
		})(tags[i]);
	}

	Appify.templates = templates;
	window.Appify = Appify;
}());