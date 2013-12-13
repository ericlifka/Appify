Appify(function (route, render, transition) {
	var $div = Appify.templates.$div;
	var $a = Appify.templates.$a;

	route(function (next, details) {
		next(details);
	});

	route('index', function (renderer, details) {
		renderer('index', details);
	});

	route('other', function (renderer, details) {
		renderer('other', details);
	});

	render(function ($outlet, details) {
		return $div(
			$outlet(details)
		).class('application');
	});

	render('index', function (details) {
		return $div(
			$div('Home Page'),
			$a('Go to Other Page').on('click', function () {
				transition('other');
			})
		).class('home');
	});

	render('other', function (details) {
		return $div(
			$div('Other Page'),
			$a('Go to Home Page').on('click', function () {
				transition('index');
			})
		).class('other');
	});
});