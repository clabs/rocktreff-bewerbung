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

	var toJSON = function ( vote ) {
		return {
			id: vote.id,
			user: vote.user,
			bid: vote.bid,
			rating: vote.rating
		}
	}

	var send = function ( res, vote ) {
		return res.send({
			votes: vote instanceof Array ?
				vote.map( toJSON ) :
				[ toJSON( vote ) ]
		})
	}

	return {

		get: function ( req, res ) {
			var id = req.params.id
			models.vote.get( id, function ( err, vote ) {
				if ( err ) return res.status( 400 ).send()
				if ( !vote ) return send( res, [] )
				send( res, vote )
			})
		},

		post: function ( req, res ) {
			var json = req.body
			if ( json.user !== req.user.id ) return res.status( 403 ).send()
			if ( !models.bid.has( json.bid ) ) return res.status( 404 ).send()
			models.vote.create( json, function ( err, vote ) {
				send( res, vote )
			})
		},


		put: function ( req, res ) {
			var id = req.params.id
			var json = req.body
			if ( json.user !== req.user.id ) return res.status( 403 ).send()
			if ( !models.bid.has( json.bid ) ) return res.status( 404 ).send()
			models.vote.get( id, function ( err, vote ) {
				if ( err || !vote ) return res.status( 400 ).send()
				models.vote.set( id, json, function ( err, vote ) {
					if ( err || !vote ) return res.status( 400 ).send()
					send( res, vote )
				})
			})
		},


		del: function ( req, res ) {
			var id = req.params.id
			models.vote.del( id, function ( err ) {
				if ( err ) res.status( 400 ).send()
				else send( res, [] )
			})
		},


		list: function ( req, res ) {
			models.vote.all( function ( err, all ) {
				if ( err ) return res.status( 500 ).send()
				send( res, all )
			})
		}

	}


}
