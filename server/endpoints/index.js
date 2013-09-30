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
	var UserViews = require( './users' )( app )
	var EventViews = require( './events' )( app )
	var RegionViews = require( './regions' )( app )
	var VoteViews = require( './votes' )( app )



	var schema = require( '../models/schemas' )
	var validate = require( 'jsonschema' ).validate


	/**
	 * Middlewares
	 */
	var loginRequired = function ( req, res, next ) {
		if ( req.user ) next()
		else res.status( 401 ).send()
	}
	var adminRequired = function ( req, res, next ) {
		var user = req.user
		if ( user && user.role === 'admin' ) return next()
		if ( user ) return res.status( 403 ).send()
		return res.status( 401 ).send()
	}
	var adminOrUserRequired = function ( req, res, next ) {
		var user = req.user
		if ( !user ) return res.status( 401 ).send()
		if ( user.role === 'admin' || user.id === req.params.id )
			 return next()
		return res.status( 403 ).send()
	}
	var friendIniOrAdminRequired = function ( req, res, next ) {
		var user = req.user
		if ( !user ) return res.status( 401 ).send()
		if ( /friend|ini|admin/.test( user.role ) )
			return next()
		return res.status( 403 ).send()
	}
	var validateJSON = function ( schema ) {
		return function ( req, res, next ) {
			if ( !req.is( 'json' ) ) return res.status( 400 )
			var v = validate( req.body, schema )
			if ( v.errors.length > 0) res.status( 422 ).send( v.errors )
			else next()
		}
	}

	/**
	 * Endpoint Definitions
	 */
	app.post( '/auth/local', passport.authenticate( 'local' ),
		function ( req, res ) {
			res.redirect( '/me' )
		}
	)
	app.get( '/me', loginRequired, UserViews.me.get )
	app.get( '/users', adminRequired, UserViews.users.list )
	app.post( '/users', validateJSON( schema.user ), UserViews.users.post )
	app.del( '/user/:id', adminRequired, UserViews.users.del )
	app.get( '/user/:id', loginRequired, UserViews.users.get )
	app.put( '/user/:id', [ adminOrUserRequired, validateJSON( schema.user ) ], UserViews.users.put )


	app.get( '/events', loginRequired, EventViews.list )
	app.post( '/events', [ adminRequired, validateJSON( schema.event ) ], EventViews.post )
	app.get( '/event/:id', loginRequired, EventViews.get )
	app.del( '/event/:id', adminRequired, EventViews.del )
	app.put( '/event/:id', [ adminRequired, validateJSON( schema.event ) ], EventViews.put )


	app.get( '/regions', loginRequired, RegionViews.list )
	app.post( '/regions', [ adminRequired, validateJSON( schema.region ) ], RegionViews.post )
	app.get( '/region/:id', loginRequired, RegionViews.get )
	app.del( '/region/:id', adminRequired, RegionViews.del )
	app.put( '/region/:id', [ adminRequired, validateJSON( schema.region ) ], RegionViews.put )

	app.get( '/votes', adminRequired, VoteViews.list )
	app.post( '/votes', [ friendIniOrAdminRequired, validateJSON( schema.vote ) ], VoteViews.post )
	app.get( '/vote/:id', friendIniOrAdminRequired, VoteViews.get )
	app.del( '/vote/:id', adminRequired, VoteViews.del )
	app.put( '/vote/:id', friendIniOrAdminRequired, VoteViews.put )


}
