Appify = require 'Appify'
{$div, $a} = Appify.templates

Appify (app) ->
	app.route 'index', (details, render) ->
		render 'index'

	app.route 'other', (details, render) ->
		render 'other'

	app.renderer ($outlet) ->
		$div(
			$outlet()
		).class 'application'

	app.renderer 'index', ->
		$div(
			$div 'Home Page'
			$a('Go to Other Page').on 'click', ->
				app.transitionTo 'other'
		).class 'home'

	app.renderer 'other', ->
		$div(
			$div 'Other Page'
			$a('Go to Home Page').on 'click', ->
				app.transitionTo 'index'
		).class 'other'
