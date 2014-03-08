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

exports = module.exports = function ( app ) {

	var crypto = require( 'crypto' )
	var models = app.get( 'models' )
	var schema = require( '../models/schemas' )
	var AccessToken = require( '../models/token' )
	var json = require( '../utils/json' )( schema.user )
	var stripPassword = json.omit( 'password' )
	var restful = require( '../utils/restful' )
	var send = restful.send( 'user' )
	var hashPassword = function ( user ) {
		// only hash the password if it's not already hashed …
		if ( user.password && !/[a-f0-9]{64}/.test( user.password ) ) {
			var sha256 = require( 'crypto' ).createHash( 'sha256' )
			user.password = sha256.update( user.password ) && sha256.digest( 'hex' )
		}
		return user
	}


	return {

		auth: function ( req, res ) {
			models.user.get( req.user.id )
				.then( function ( user ) {
					return AccessToken.forUser( user )
				})
				.then( function ( token ) {
					res.send({ token: token })
				})
		},


		callback: function ( req, res ) {
			models.user.get( req.user.id )
				.then( function ( user ) {
					return AccessToken.forUser( user )
				})
				.then( function ( token ) {
					var html = '<!DOCTYPE html>' +
						'<html>' +
						'<head><title></title></head>' +
						'<body bgcolor="#000">' +
							'<script type="text/javascript">' +
							'var token = JSON.stringify('+JSON.stringify( token ) +')'+
							';window.opener.postMessage(token,"*")' +
							';window.close()' +
							'</script>' +
						'</body>' +
						'</html>'
					res.set( 'Content-Type', 'text/html' )
					res.send( html )
				})
		},


		me: function ( req, res ) {
			models.user.get( req.user.id )
				.then( stripPassword )
				.done( send( res ) )
		},


		get: function ( req, res ) {
			var id = req.params.id
			models.user.get( id )
				.then( stripPassword )
				.then( send( res ), function ( err ) {
					res.status( 400 ).send()
				})
		},

		post: function ( req, res ) {
			if ( req.body.role !== '' )
				if ( !req.user || req.user.role !== 'admin' )
					return res.status( 403 ).send()
			if ( !req.body.password )
				return res.status( 400 ).send()


			models.user.find( { email: req.body.email } )
				.then( function ( users ) {
					if ( users.length > 0 ) throw res.status( 409 ).send()
					return json.create( req.body )
				})
				.then( hashPassword )
				.then( function ( user ) {
					return models.user.create( user )
				})
				.then( stripPassword )
				.then( function ( user ) {
					app.get( 'mailer' ).greetings( user )
					return user
				})
				.then( send( res ) )
		},


		put: function ( req, res ) {
			var id = req.params.id
			req.body.id = id
			if ( id !== req.user.id || req.body.role !== '' )
				if ( !req.user || req.user.role !== 'admin' )
					return res.status( 403 ).send()
			if ( id !== req.body.id )
				return res.status( 400 ).send()

			models.user.get( id )
				.then( json.merge( req.body ) )
				.then( hashPassword )
				.then( function ( user ) {
					return models.user.save( user )
				})
				.then( stripPassword )
				.then( send( res ) )
		},


		del: function ( req, res ) {
			var id = req.params.id
			models.user.del( id )
				.then( send( res ), function ( err ) {
					res.status( 400 ).send()
				})
		},


		list: function ( req, res ) {
			var query = req.user.role === '' ?
				{ id: req.user.id } : req.query
			models.user.find( query )
				.then( stripPassword )
				.then( send( res ), function ( err ) {
					res.status( 500 ).send()
				})
		}

	}


}
