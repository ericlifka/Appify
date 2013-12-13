Appify(function (app) {
	var $div = Appify.templates.$div;
	var $a = Appify.templates.$a;

	app.route(function (next, details) {
		console.log('route middleware');
		
		next(details);
	});

	app.route('index', function (render, details) {
		console.log('route index');
		
		render('index', details);
	});

	app.route('other', function (render, details) {
		console.log('route other');

		render('other', details);
	});

	app.renderer(function ($outlet, details) {
		console.log('renderer middleware');

		return $div(
			$outlet(details)
		).class('application');
	});

	app.renderer('index', function (details) {
		console.log('renderer index');

		return $div(
			$div('Home Page'),
			$a('Go to Other Page').on('click', function () {
				app.transitionTo('other');
			})
		).class('home');
	});

	app.renderer('other', function (details) {
		console.log('renderer other');

		return $div(
			$div('Other Page'),
			$a('Go to Home Page').on('click', function () {
				app.transitionTo('index');
			})
		).class('other');
	});
});