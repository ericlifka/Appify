Appify = window.Appify
{$div, $a} = Appify.templates

Appify (route, render, transition) ->
	route (next, details) ->
		next details

	route 'index', (renderer, details) ->
		renderer 'index', details

	route 'other', (renderer, details) ->
		renderer 'other', details

	render ($outlet, details) ->
		$div(
			$outlet details
		).class 'application'

	render 'index', (details) ->
		$div(
			$div 'Home Page'
			$a('Go to Other Page').on 'click', ->
				app.transitionTo 'other'
		).class 'home'

	render 'other', (details) ->
		$div(
			$div 'Other Page'
			$a('Go to Home Page').on 'click', ->
				app.transitionTo 'index'
		).class 'other'
