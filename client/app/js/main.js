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

/**
 * Runtime configuration for requirejs goes in here.
 * Things related to the build/distribution will be
 * configured in the Gruntfile.js
 */
requirejs.config({
	paths: {
		jquery:'vendor/jquery/jquery',
		handlebars:'vendor/handlebars/handlebars',
		ember: 'vendor/ember/ember',
		restless: 'vendor/ember-restless/dist/ember-restless+extras',
		bootstrap: 'vendor/bootstrap/dist/js/bootstrap',
		wysiwyg: 'vendor/bootstrap-wysiwyg/bootstrap-wysiwyg',
		'jquery-hotkeys': 'vendor/jquery.hotkeys/jquery.hotkeys',
		socketio: 'vendor/socket.io-client/dist/socket.io',
		moment: 'vendor/moment/min/moment-with-langs.min',
		audio5js: 'vendor/audio5js/audio5',
		wavesurfer: 'vendor/wavesurfer.js/build/wavesurfer.min',
		stellar: 'vendor/jquery.stellar/jquery.stellar'
	},
	shim:{
		ember: {
			deps:[ 'jquery', 'handlebars' ],
			exports: 'Ember'
		},
		restless: {
			deps:[ 'ember' ],
			exports: 'RL'
		},
		wysiwyg: {
			deps:[ 'jquery', 'jquery-hotkeys' ],
			exports: 'wysiwyg'
		},
		bootstrap: { deps: [ 'jquery' ] },
		wavesurfer: { exports: 'WaveSurfer' },
		stellar: { deps: [ 'jquery' ] }
	},
	waitSeconds: 15,
	noGlobal: false
})

define( 'bb', [

	'ember',
	'restless',
	'jquery',
	'handlebars',
	'templates',
	'bootstrap',
	'views/bootstrap',
	'utils/prototypes'

], function ( Ember ) {

	var BB = Ember.Application.create({
		// namespaces
		Widgets: Ember.Namespace.create()
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
	'store/adapter',

	// models
	'models/models',

	// helper
	'helpers/handlebar_helpers',

	// controllers
	'controllers/login',
	'controllers/bid',
	'controllers/audioplayer',
	'controllers/xhrprogress',

	// views
	'views/application',
	'views/dropbox',
	'views/audioplayer',

	// routes
	'routes/resources',
	'routes/index'

])
