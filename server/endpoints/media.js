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
	var json = require( '../utils/json' )( schema.media )
	var send = json.send( 'media' )
	var empty = function ( res ) {
		return function () {
			send( res )( [] )
		}
	}

	return {

		get: function ( req, res ) {
			var id = req.params.id
			models.media.get( id )
				.then( function ( media ) {
					return models.bid.get( media.bid )
				}, empty( res ) )
				.then( function ( bid ) {
					if ( bid.user !== req.user.id && req.user.role === '' )
						throw res.status( 403 ).send()
					return bid
				})
				.then( function () {
					return models.media.get( id )
				})
				.then( send( res ) )
		},

		post: function ( req, res ) {
			var json = req.body
			json.url = json.url || ''
			models.bid.get( json.bid )
				.then( function ( bid ) {
					if ( !bid || (bid.user !== req.user.id && req.user.role !== 'admin') )
						throw res.status( 403 ).send()
					return models.media.create( json )
				})
				.then( send( res ) )
		},


		put: function ( req, res ) {
			var id = req.params.id
			var json = req.body

			if ( json.user !== req.user.id ) return res.status( 403 ).send()
			if ( !models.bid.has( json.bid ) ) return res.status( 404 ).send()

			models.media.get( id )
				.then( function ( media ) {
					if ( !media ) throw res.status( 400 ).send()
					return models.media.set( id, json )
				})
				.then( send( res ) )
		},


		del: function ( req, res ) {
			var id = req.params.id
			models.media.get( id )
				.then( function ( media ) {
					if ( !media ) throw res.status( 400 ).send()
					return models.bid.get( media.bid )
				})
				.then( function ( bid ) {
					if ( !bid )
						throw res.status( 400 ).send()
					if ( bid.user !== req.user.id && req.user.role !== 'admin' )
						throw res.status( 403 ).send()
					return models.media.del( id )
				})
				.then( send( res ) )
		},


		list: function ( req, res ) {
			var query = req.user.role === '' ?
				{ user: req.user.id } : req.query
			models.media.find( query )
				.then( send( res ), function ( err ) {
					res.status( 500 ).send()
				})
		}

	}


}
