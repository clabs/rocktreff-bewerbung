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
	var send = json.send( 'bid' )
	var stripMedia = json.omit( 'media' )
	var stripVotes = json.omit( 'votes' )
	var stripNotes = json.omit( 'notes' )
	var empty = function ( res ) {
		return function () {
			send( res )( [] )
		}
	}

	var injectMediaURL = function ( media ) {
		function addURL ( media ) {
			if ( !media.url || media.url === '' )
				media.url = 'http://'+app.get( 'host' )+':'+app.get( 'port' )+'/uploads/'+media.id
			return media
		}
		if ( media instanceof Array )
			return media.map( function ( media ) {
				return addURL( media )
			})
		return addURL( media )
	}


	function injectMedia ( bid ) {
		return models.media.find( { bid: bid.id } )
			.then( function ( media ) {
				return { media: injectMediaURL( media ) }
			})
			.then( json.merge( bid ) )
	}

	function injectVotes ( user ) {
		return function ( bid ) {
			if ( user.role === '' ) return stripVotes( bid )
			return models.vote.find( { bid: bid.id } )
				.then( function ( votes ) {
					return { votes: votes }
				})
				.then( json.merge( bid ) )
		}
	}

	function injectNotes ( user ) {
		return function ( bid ) {
			if ( user.role === '' ) return stripNotes( bid )
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
			if ( !models.bid.has( id ) )
				return res.status( 404 ).send()
			if ( json.id !== id )
				return res.status( 401 ).send()

			models.bid.save( json )
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
			models.bid.find( query )
				.then( function ( bids ) {
					if ( !( bids instanceof Array ) )
						bids = [ bids ]
					return bids
				})
				.then( function ( bids ) {
					bids.forEach( function ( bid ) {
						injectMedia( bid )
							.then( injectVotes( req.user ) )
							.then( injectNotes( req.user ) )
					})
					return bids
				})
				.then( send( res ), function ( err ) {
					res.status( 500 ).send()
				})
		}

	}


}
