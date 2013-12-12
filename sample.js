Appify(function (app) {
	// application route handler, checks app state like authentication status
	app.route(function (routeDetails, next) {
		if (routeDetails.route !== 'login' && !app.cache('user')) {
			app.transitionTo('login');
		} else {
			next();
		}
	});

	// route specific handler, loads data and sets the renderer
	app.route('index', function () {
		// caching is convenient but not necessary, these could always be ajax calls, creating an entirely 'functional' design
		if (app.cache('goals')) {	
			app.render('index', app.cache('goals'));
		} else {
			$.ajax({
				//load some data
			}).then(function (data) {
				app.cache(data.goals);
				app.render('index', data.goals);
			}, function () {
				app.render('error');
			});
		}
	});

	// -- This is the default behavior if a route isn't provided
	// app.route('login', function () {
	// 	app.setRenderer('login');
	// 	app.reRender();
	// });

	// application level template
	app.render(function ($outlet) {
		return $div(
			$authBar(app.cache('user')),
			$outlet(),
			$footer()
		).class("app");
	});

	// route specific template
	// takes data as a parameter
	app.render('index', function (goals) {
		return $div(
			$div("Welcome " + app.data.user.displayName).class("banner"),
			$div(
				_.map(goals, function (goal) {
					return $goal(goal);		// haven't figure out best way to make render helpers like this yet
				})
			).class("goals")
		).class("home");
	});

	app.render('login', function () {
		return $div({id: "loginForm"}
			$input({type: "text", id: "username"}),
			$input({type: "password", id: "password"}),
			$button("Log In").on('click', function (target) {
				var username = $("#username").value();
				var password = $("#password").value();
				app.login(username, password).error(function () {
					$("#loginForm").addClass("error");
				});
			});
		).class("login");
	});

	// helpers pull state changing logic out of the views for cleaner boundaries
	// returning promises is a good way to catch errors in the view layer
	app.helper('login', function (username, password) {
		// returns the ajax promise
		return $.ajax({
			// login request
		}).then(function (data) {
			app.cache('user', data.user);
			app.transitionTo('index');
		});
	});
});
