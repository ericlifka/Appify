Appify(function (app) {
	var $div = Appify.templates.$div;
	var $a = Appify.templates.$a;

	app.route('index', function (details, render) {
		render('index');
	});

	app.route('other', function (details, render) {
		render('other');
	});

	app.renderer(function ($outlet) {
		$div(
			$outlet()
		).class('application');
	});

	app.renderer('index', function () {
		return $div(
			$div('Home Page'),
			$a('Go to Other Page').on('click', function () {
				app.transitionTo('other');
			})
		).class('home');
	});

	app.renderer('other', function () {
		return $div(
			$div('Other Page'),
			$a('Go to Home Page').on('click', function () {
				app.transitionTo('index');
			})
		).class('other');
	});
});