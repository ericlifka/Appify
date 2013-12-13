Appify(function (app) {
	var $div = Appify.templates.$div;
	var $a = Appify.templates.$a;

	app.route(function (next, details) {
		next(details);
	});

	app.route('index', function (render, details) {
		render('index', details);
	});

	app.route('other', function (render, details) {
		render('other', details);
	});

	app.renderer(function ($outlet, details) {
		return $div(
			$outlet(details)
		).class('application');
	});

	app.renderer('index', function (details) {
		return $div(
			$div('Home Page'),
			$a('Go to Other Page').on('click', function () {
				app.transitionTo('other');
			})
		).class('home');
	});

	app.renderer('other', function (details) {
		return $div(
			$div('Other Page'),
			$a('Go to Home Page').on('click', function () {
				app.transitionTo('index');
			})
		).class('other');
	});
});