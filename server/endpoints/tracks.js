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

	var models = app.get( 'models' )
	var schema = require( '../models/schemas' )
	var json = require( '../utils/json' )( schema.track )
	var restful = require( '../utils/restful' )
	var send = restful.send( 'track' )
	var empty = function ( res ) {
		return function () {
			send( res )( )
		}
	}

	return {

		get: function ( req, res ) {
			var id = req.params.id
			models.track.get( id )
				.then( send( res ), empty( res ) )
		},

		post: function ( req, res ) {
			models.track.create( req.body )
				.then( send( res ) )
		},


		put: function ( req, res ) {
			var id = req.params.id
			req.body.id = id

			models.track.save( req.body )
				.then( send( res ), function ( err ) {
					res.status( 400 ).send()
				})
		},


		del: function ( req, res ) {
			var id = req.params.id
			models.track.del( id )
				.then( send( res ), function ( err ) {
					res.status( 400 ).send()
				})
		},


		list: function ( req, res ) {
			var query = req.query
			models.track.find( query )
				.then( send( res ), function ( err ) {
					res.status( 500 ).send()
				})
		}

	}


}
