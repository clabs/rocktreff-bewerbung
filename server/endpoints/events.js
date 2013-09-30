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

	var toJSON = function ( event ) {
		return {
			id: event.id,
			name: event.name,
			opening_date: event.opening_date,
			closing_date: event.closing_date,
		}
	}

	var send = function ( res, event ) {
		return res.send({
			events: event instanceof Array ?
				event.map( toJSON ) :
				[ toJSON( event ) ]
		})
	}

	return {

		get: function ( req, res ) {
			var id = req.params.id
			models.event.get( id, function ( err, event ) {
				if ( err ) return res.status( 400 ).send()
				if ( !event ) return send( res, [] )
				send( res, event )
			})
		},

		post: function ( req, res ) {
			var json = req.body
			models.event.create( json, function ( err, event ) {
				send( res, event )
			})
		},


		put: function ( req, res ) {
			var id = req.params.id
			var json = req.body
			models.event.get( id, function ( err, event ) {
				if ( err || !event ) return res.status( 400 ).send()
				models.event.set( id, json, function ( err, event ) {
					if ( err || !event ) return res.status( 400 ).send()
					send( res, event )
				})
			})
		},


		del: function ( req, res ) {
			var id = req.params.id
			models.event.del( id, function ( err ) {
				if ( err ) res.status( 400 ).send()
				else send( res, [] )
			})
		},


		list: function ( req, res ) {
			models.event.all( function ( err, all ) {
				if ( err ) return res.status( 500 ).send()
				send( res, all )
			})
		}

	}


}
