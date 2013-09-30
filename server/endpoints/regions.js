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

	var toJSON = function ( region ) {
		return {
			id: region.id,
			name: region.name
		}
	}

	var send = function ( res, region ) {
		return res.send({
			regions: region instanceof Array ?
				region.map( toJSON ) :
				[ toJSON( region ) ]
		})
	}

	return {

		get: function ( req, res ) {
			var id = req.params.id
			models.region.get( id, function ( err, region ) {
				if ( err ) return res.status( 400 ).send()
				if ( !region ) return send( res, [] )
				send( res, region )
			})
		},

		post: function ( req, res ) {
			var json = req.body
			models.region.create( json, function ( err, region ) {
				send( res, region )
			})
		},


		put: function ( req, res ) {
			var id = req.params.id
			var json = req.body
			models.region.get( id, function ( err, region ) {
				if ( err || !region ) return res.status( 400 ).send()
				models.region.set( id, json, function ( err, region ) {
					if ( err || !region ) return res.status( 400 ).send()
					send( res, region )
				})
			})
		},


		del: function ( req, res ) {
			var id = req.params.id
			models.region.del( id, function ( err ) {
				if ( err ) res.status( 400 ).send()
				else send( res, [] )
			})
		},


		list: function ( req, res ) {
			models.region.all( function ( err, all ) {
				if ( err ) return res.status( 500 ).send()
				send( res, all )
			})
		}

	}


}
