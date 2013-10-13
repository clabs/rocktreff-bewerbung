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
	var json = require( '../utils/json' )( schema.bid )
	var send = json.send( 'bids' )
	var empty = function ( res ) {
		return function () {
			send( res )( [] )
		}
	}


	function injectMedia ( bid ) {
		return models.media.find( { bid: bid.id } )
			.then( function ( media ) {
				return { media: media }
			})
			.then( json.merge( bid ) )
	}

	function injectVotes ( user ) {
		return function ( bid ) {
			if ( user.role === '' ) return bid
			return models.vote.find( { bid: bid.id } )
				.then( function ( votes ) {
					console.log( { bid: bid.id } , votes )
					return { votes: votes }
				})
				.then( json.merge( bid ) )
		}
	}

	function injectNotes ( user ) {
		return function ( bid ) {
			if ( user.role === '' ) return bid
			return models.note.find( { bid: bid.id, user: user.id } )
				.then( function ( notes ) {
					return { notes: notes }
				})
				.then( json.merge( bid ) )
		}
	}


	return {

		get: function ( req, res ) {
			var id = req.params.id
			models.bid.get( id )
				.then( function ( bid ) {
					if ( bid.user !== req.user.id && req.user.role === '' )
							throw res.status( 403 ).send()
					return bid
				})
				.then( injectMedia )
				.then( injectVotes( req.user ) )
				.then( injectNotes( req.user ) )
				.then( send( res ), empty( res ) )
		},

		post: function ( req, res ) {
			if ( req.body.user !== req.user.id )
				return res.status( 403 ).send()
			if ( req.user.role !== '' )
				return res.status( 403 ).send()

			models.bid.find( { user: req.user.id, event: req.body.event } )
				.then( function ( bid ) {
					if ( bid.length > 0 ) throw res.status( 409 ).send()
					return models.bid.create( req.body )
				})
				.then( injectMedia )
				.then( injectVotes( req.user ) )
				.then( injectNotes( req.user ) )
				.then( send( res ) )
		},


		put: function ( req, res ) {
			var id = req.params.id
			var json = req.body

			if ( json.user !== req.user.id )
				return res.status( 403 ).send()
			if ( !models.bid.has( json.bid ) )
				return res.status( 404 ).send()

			models.bid.get( id )
				.then( function ( bid ) {
					return models.bid.set( id, json )
				})
				.then( injectMedia )
				.then( injectVotes( req.user ) )
				.then( injectNotes( req.user ) )
				.then( send( res ), function ( err ) {
					res.status( 400 ).send()
				})
		},


		del: function ( req, res ) {
			var id = req.params.id
			models.bid.get( id )
				.then( function ( bid ) {
					if ( bid.user !== req.user.id && req.user.role === '' )
						throw res.status( 403 ).send()
					return models.bid.del( id )
				}, function ( err ) {
					res.status( 400 ).send( err )
				})
				.then( send( res ) )
		},


		list: function ( req, res ) {
			var query = req.user.role === '' ?
				{ user: req.user.id } : req.query
			console.log( query )
			models.bid.find( query )
				.then( function ( bids ) {
					if ( !( bids instanceof Array ) )
						bids = [ bids ]
					return bids.map( json.merge({
						media: [], votes:[], notes: []
					}))
				})
				.then( send( res ), function ( err ) {
					res.status( 500 ).send()
				})
		}

	}


}
