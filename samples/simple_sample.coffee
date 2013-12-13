Appify = window.Appify
{$div, $a} = Appify.templates

Appify (app) ->
	app.route (next, details) ->
		next details

	app.route 'index', (render, details) ->
		render 'index', details

	app.route 'other', (render, details) ->
		render 'other', details

	app.renderer ($outlet, details) ->
		$div(
			$outlet details
		).class 'application'

	app.renderer 'index', (details) ->
		$div(
			$div 'Home Page'
			$a('Go to Other Page').on 'click', ->
				app.transitionTo 'other'
		).class 'home'

	app.renderer 'other', (details) ->
		$div(
			$div 'Other Page'
			$a('Go to Home Page').on 'click', ->
				app.transitionTo 'index'
		).class 'other'
