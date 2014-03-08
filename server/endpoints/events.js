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

	var _ = require( 'lodash' )
	var Promise = require( 'promise' )
	var models = app.get( 'models' )
	var schema = require( '../models/schemas' )
	var json = require( '../utils/json' )( schema.event )
	var restful = require( '../utils/restful' )
	var send = restful.send( 'event' )
	var empty = function ( res ) {
		return function () {
			send( res )( )
		}
	}

	var injectTracks = _.curry( function ( res, event ) {
		return models.track.find( { event: event.id } )
			.then( function ( tracks ) {
				restful.sideload( res, 'track', tracks )
				return tracks
			})
			.then( function ( tracks ) {
				return { tracks: _.map( tracks, function ( item ) { return item.id }) }
			})
			.then( json.merge( event ) )
	})

	return {

		get: function ( req, res ) {
			var id = req.params.id
			models.event.get( id )
				.then( injectTracks( res ) )
				.then( send( res ), empty( res ) )
		},

		post: function ( req, res ) {
			var json = req.body
			models.event.create( json )
				.then( send( res ) )
		},


		put: function ( req, res ) {
			var id = req.params.id
			req.body.id = id

			models.event.save( req.body )
				.then( injectTracks( res ) )
				.then( send( res ), function ( err ) {
					res.status( 400 ).send()
				})
		},


		del: function ( req, res ) {
			var id = req.params.id
			models.event.del( id )
				.then( send( res ), function ( err ) {
					res.status( 400 ).send()
				})
		},


		list: function ( req, res ) {
			var query = req.query
			models.event.find( query )
				.then( function ( events ) {
						if ( !( events instanceof Array ) )
							events = [ events ]
						return events
					})
					.then( function ( events ) {
						return Promise.all( events.map( function ( event ) {
							return Promise.from( event )
								.then( injectTracks( res ) )
						}))
					})
				.then( send( res ), function ( err ) {
					res.status( 500 ).send( err.toString() )
				})
		}

	}


}
