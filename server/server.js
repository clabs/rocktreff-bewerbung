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
var ENV = app.get( 'env' )

// General app config stuff
app.configure( function () {
	app.disable( 'x-powered-by' )

	app.set( 'client-url', 'http://localhost:1337' )

	// Password encryption
	app.set( 'crypto-key', 'otETq4Tq' )

	app.set( 'port', 1338 )

	// Middlewares
	if ( 'development' === ENV )
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
	if ( 'development' === ENV )
	app.use( express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}))
})


// Internal includes
var models = require( './models/index' )( app )
var strategies = require( './passport/index' )( app, passport )
var middlewares = require( './middleware/index' )( app )
var endpoints = require( './endpoints/index' )( app, passport )


// yay ho!
app.listen( app.get( 'port' ) )

var PID_FILE  = './server.pid'
var fs = require( 'fs' )

// set process title
process.title = 'rocktreff-api-server ('+ ENV +')'
// write .pid file
fs.writeFileSync( PID_FILE, process.pid + '\n' )
// cleanup
process.on( 'SIGINT', function () {
	process.stdout.write( '\nHave a nice day! ... (^_^)/\"\n' )
	fs.unlinkSync( PID_FILE )
	process.exit( 0 )
})

// nerdy stuff
process.stdout.write( '\u001B[2J\u001B[0;0f' +
	' ______ _____ _____  _   _____________ _________________  ____________\n' +
	' | ___ \\  _  /  __ \\| | / /_   _| ___ \\  ___|  ___|  ___| | ___ \\ ___ \\\n' +
	' | |_/ / | | | /  \\/| |/ /  | | | |_/ / |__ | |_  | |_    | |_/ / |_/ /\n' +
	' |    /| | | | |    |    \\  | | |    /|  __||  _| |  _|   | ___ \\ ___ \\\n' +
	' | |\\ \\\\ \\_/ / \\__/\\| |\\  \\ | | | |\\ \\| |___| |   | |     | |_/ / |_/ /\n' +
	' \\_| \\_|\\___/ \\____/\\_| \\_/ \\_/ \\_| \\_\\____/\\_|   \\_|     \\____/\\____/\n' +
	'\n' +
	'\u001b[32mStarting api server on port '+ app.get( 'port' ) +' in '+ ENV +' mode.\u001b[39m\n'
)
