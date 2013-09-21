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

exports = module.exports = function ( app, passport ) {

	// Views
	var users = require( './users' )( app )


	// Authentication/Authorization Middlewares
	var loginRequired = function ( req, res, next ) {
		if ( req.user ) next()
		else res.status( 401 ).send()
	}
	var adminRequired = function ( req, res, next ) {
		var user = req.user
		if ( user && user.rights.godmode ) next()
		else res.status( 401 ).send()
	}


	app.post( '/auth/local', passport.authenticate( 'local' ), function ( req, res ) {
		res.redirect( '/me' )
	})

	app.get( '/me',       loginRequired, users.me.get )
	app.get( '/users',    adminRequired, users.users.list )
	app.get( '/user/:id', adminRequired, users.users.get )
	app.put( '/user/:id', adminRequired, users.users.put )
	app.del( '/user/:id', adminRequired, users.users.del )


}
