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

// External includes
var express = require( 'express' )
var passport = require ( 'passport' )

// Instantiate app
var app = express()

// General app config stuff
app.configure( function () {
	app.disable( 'x-powered-by' )

	app.set( 'client-url', 'http://localhost:1337' )

	// Password encryption
	app.set( 'crypto-key', 'otETq4Tq' )

	// Middlewares
	app.use( express.logger( 'dev' ) )
	app.use( express.compress() )
	app.use( express.cookieParser() )
	app.use( express.json() )
	app.use( express.urlencoded() )
	app.use( express.session({
		secret: 'R0(|<7R3PhPhB4|\\|DB3\\/\\/3RBU|\\|9'
	}))

	app.use( passport.initialize() )
	app.use( passport.session() )

	// Development only
	app.use( express.errorHandler() )
})


// Internal includes
var models = require( './models/index' )( app )
var strategies = require( './passport/index' )( app, passport )
var middlewares = require( './middleware/index' )( app )
var endpoints = require( './endpoints/index' )( app, passport )



exports = module.exports = app
