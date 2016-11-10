/*
 * ______ _____ _____  _   _____________ _________________  ____________
 * | ___ \  _  /  __ \| | / /_   _| ___ \  ___|  ___|  ___| | ___ \ ___ \
 * | |_/ / | | | /  \/| |/ /  | | | |_/ / |__ | |_  | |_    | |_/ / |_/ /
 * |    /| | | | |    |    \  | | |    /|  __||  _| |  _|   | ___ \ ___ \
 * | |\ \\ \_/ / \__/\| |\  \ | | | |\ \| |___| |   | |     | |_/ / |_/ /
 * \_| \_|\___/ \____/\_| \_/ \_/ \_| \_\____/\_|   \_|     \____/\____/
 *
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <rob ∂ rocktreff de> wrote this file. As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return.
 *
 */
'use strict';

requirejs.config({
	paths: {
		jquery:'vendor/jquery/dist/jquery.min',
		handlebars:'vendor/handlebars/handlebars',
		ember: 'vendor/ember/ember',
		data: 'vendor/ember-data/ember-data',
		bootstrap: 'vendor/bootstrap/dist/js/bootstrap.min',
		moment: 'vendor/moment/min/moment-with-langs.min',
		audio5js: 'vendor/audio5js/audio5',
		hammer: 'vendor/hammerjs/hammer.min'
	},
	shim: {
		ember: { deps:[ 'jquery', 'handlebars' ], exports: 'Ember' },
		data: { deps:[ 'ember' ] },
		bootstrap: { deps: [ 'jquery' ] }
	},
	waitSeconds: 15,
	noGlobal: false
})

window.HOSTNAME = 'https://api.rocktreff.de'

define( 'bb', [

	'ember',
	'data',
	'auth',
	'jquery',
	'handlebars',
	'templates',
	'bootstrap',
	'views/bootstrap',
	'utils/prototypes',
	'utils/ember'

], function ( Ember ) {

	var BB = Ember.Application.create({
		host: window.HOSTNAME,
		// namespaces
		Widgets: Ember.Namespace.create(),
		LOG_ACTIVE_GENERATION: false,
		// activate logging of automatically generated routes and controllers
		LOG_STACKTRACE_ON_DEPRECATION: false,
		// activate logging of deprecated method or property usage
		LOG_TRANSITIONS: false,
		// activate basic logging of successful transitions
		LOG_TRANSITIONS_INTERNAL: false,
		// DOM element or jQuery-compatible selector string where your app will be rendered
		LOG_VIEW_LOOKUPS: false,
	})
	// defer initialization until all modules are loaded
	BB.deferReadiness()
	// expose BB to the real world!
	return ( window.BB = BB )
})

/**
 * Bootstrap the BB frontend.
 */
require([

	// get back the reference to our application
	'bb',
	'app',

	// store
	'store/ds_adapter',

	// models
	'models/models',

	// helper
	'helpers/handlebar_helpers',

	// controllers
	'controllers/controller',
	'controllers/login',
	'controllers/bid',
	'controllers/audioplayer',
	'controllers/xhrprogress',

	// views
	'views/application',
	'views/dropbox',
	'views/audioplayer',
	'views/components',

	// routes
	'routes/resources',
	'routes/index'

])
