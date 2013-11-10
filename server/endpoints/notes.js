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
	var json = require( '../utils/json' )( schema.note )
	var send = json.send( 'note' )
	var empty = function ( res ) {
		return function () {
			send( res )( [] )
		}
	}


	return {

		get: function ( req, res ) {
			var id = req.params.id
			models.note.get( id )
				.then( send( res ), empty( res ) )
		},


		post: function ( req, res ) {
			var json = req.body

			if ( json.user !== req.user.id ) return res.status( 403 ).send()
			if ( !models.bid.has( json.bid ) ) return res.status( 404 ).send()

			models.note.create( json ).then( send( res ) )
		},


		put: function ( req, res ) {
			var id = req.params.id

			if ( req.body.user !== req.user.id )
				return res.status( 403 ).send()
			if ( !models.bid.has( req.body.bid ) )
				return res.status( 404 ).send()
			if ( !models.note.has( id ) )
				return res.status( 400 ).send()
			if ( id !== req.body.id )
				return res.status( 400 ).send()

			models.note.save( req.body )
				.then( send( res ) )
		},


		del: function ( req, res ) {
			var id = req.params.id
			models.note.get( id )
				.then( function ( note ) {
					if ( !note )
						throw res.status( 400 ).send()
					if ( note.user !== req.user.id )
						throw res.status( 403 ).send()
					return models.note.del( id )
				})
				.then( send( res ) )
		},


		list: function ( req, res ) {
			var query = req.user.role === '' ?
				{ user: req.user.id } : req.query
			models.note.find( query )
				.then( send( res ), function ( err ) {
					res.status( 500 ).send()
				})
		}


	}
}
