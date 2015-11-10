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
	var json = require( '../utils/json' )( schema.bid )
	var restful = require( '../utils/restful' )
	var send = restful.send( 'bid' )
	var stripMedia = json.omit( 'media' )
	var stripVotes = json.omit( 'votes' )
	var stripNotes = json.omit( 'notes' )
	var stripTrack = json.omit( 'track' )
	var stripPassword = json.omit( 'password' )
	var empty = function ( res ) {
		return function () {
			console.log( arguments )
			send( res )( [] )
		}
	}

	var injectMediaURL = function ( media ) {
		function addURL ( media ) {
			if ( media.type !== 'youtube' )
				media.url = app.get( 'hostname' )+'/uploads/'+media.id
			return media
		}
		if ( media instanceof Array )
			return media.map( function ( media ) {
				return addURL( media )
			})
		return addURL( media )
	}

	var injectMedia = _.curry( function ( res, bid ) {
		return models.media.find( { bid: bid.id } )
			.then( injectMediaURL )
			.then( function ( media ) {
				restful.sideload( res, 'media', media )
				return media
			})
			.then( function ( media ) {
				return { media: _.map( media, function ( item ) { return item.id }) }
			})
			.then( json.merge( bid ) )
	})

	var injectVotes = _.curry( function ( user, res, bid ) {
		if ( user.role === '' ) return stripVotes( bid )
		return models.vote.find( { bid: bid.id } )
			.then( function ( votes ) {
				restful.sideload( res, 'vote', votes )
				return votes
			})
			.then( function ( votes ) {
				var users = _.map( votes, function ( vote ) {
					return models.user.find( { id: vote.user } )
				})
				return Promise.all( users )
					.then( function ( users ) {
						_.each( users, function ( user ) {
							restful.sideload( res, 'user', stripPassword(user) )
						})
						return votes
					})
			})
			.then( function ( votes ) {
				return { votes: _.map( votes, function ( item ) { return item.id }) }
			})
			.then( json.merge( bid ) )
	})

	var injectNotes = _.curry( function ( user, res, bid ) {
		if ( user.role === '' ) return stripNotes( bid )
		return models.note.find( { bid: bid.id, user: user.id } )
			.then( function ( notes ) {
				restful.sideload( res, 'note', notes )
				return notes
			})
			.then( function ( notes ) {
				return { notes: _.map( notes, function ( item ) { return item.id }) }
			})
			.then( json.merge( bid ) )
	})

	var injectTrack = _.curry( function ( user, res, bid ) {
		if ( user.role === '' ) return stripTrack( bid )
		return models.track.find( { id: bid.track } )
			.then( function ( tracks ) {
				restful.sideload( res, 'track', tracks )
				return tracks[0]
			})
			.then( function ( track ) {
				return { track: track }
			})
			.then( json.merge( bid ) )
	})


	return {

		get: function ( req, res ) {
			var id = req.params.id
			var user = req.user || {}
			models.bid.get( id )
				.then( injectMedia( res ) )
				.then( injectVotes( user, res ) )
				.then( injectNotes( user, res ) )
				.then( injectTrack( user, res ) )
				.then( send( res ), empty( res ) )
		},

		post: function ( req, res ) {
			var user = req.user || {}

			models.bid.create( req.body )
				.then( function ( bid ) {
					app.get( 'mailer' ).greetings( bid )
					return bid
				})
				.then( injectMedia( res ) )
				.then( injectVotes( user, res ) )
				.then( injectNotes( user, res ) )
				.then( injectTrack( user, res ) )
				.then( send( res ) )
		},


		put: function ( req, res ) {
			var id = req.params.id
			req.body.id = id
			var user = req.user || {}

			if ( !models.bid.has( id ) )
				return res.status( 404 ).send()
			if ( req.body.id !== id )
				return res.status( 401 ).send()

			models.bid.save( req.body )
				.then( injectMedia( res ) )
				.then( injectVotes( user, res ) )
				.then( injectNotes( user, res ) )
				.then( injectTrack( user, res ) )
				.then( send( res ), function ( err ) {
					res.status( 400 ).send()
				})
		},


		del: function ( req, res ) {
			var id = req.params.id
			if ( req.user.role === 'admin' )
				return res.status( 403 ).send()
			if ( !models.bid.has( id ) )
				return res.status( 404 ).send()
			models.bid.get( id )
				.then( function ( bid ) {
					return models.bid.del( id )
				})
				.then( send( res ), function ( err ) {
					res.status( 400 ).send( err )
				})
		},


		list: function ( req, res ) {
			var user = req.user || {}
			var query = req.query
			models.bid.find( query )
				.then( function ( bids ) {
					if ( !( bids instanceof Array ) )
						bids = [ bids ]
					return bids
				})
				.then( function ( bids ) {
					return Promise.all( bids.map( function ( bid ) {
						return Promise.from( bid )
							.then( injectMedia( res ) )
							.then( injectVotes( user, res ) )
							.then( injectNotes( user, res ) )
							.then( injectTrack( user, res ) )
					}))
				})
				.then( send( res ), function ( err ) {
					res.status( 500 ).send( err )
				})
		}
	}
}
