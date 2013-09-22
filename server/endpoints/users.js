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

	var crypto = require( 'crypto' )
	var models = app.get( 'models' )

	var toJSON = function ( user ) {
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			created: user.created,
			role: user.role
		}
	}

	return {

		me: {
			get: function ( req, res ) {
				var user = [ toJSON( req.user ) ]
				res.send( { users: user } )
			}
		},

		users: {

			get: function ( req, res ) { },

			post: function ( req, res ) {
				var json = req.body
				// set password hash
				var sha256 = crypto.createHash( 'sha256' )
				json.password = sha256.update( json.password ) && sha256.digest( 'hex' )
				// validate role field
				var byAdmin = req.user && req.user.role === 'admin'
				if ( json.role !== '' && !byAdmin )
					return res.status( 400 ).send()
				models.user.find( { email: json.email }, function ( err, user ) {
					if ( user ) return res.status( 409 ).send()
					models.user.create( json, function ( err, user ) {
						res.send( { users: [ toJSON( user ) ] } )
					})
				})
			},


			put: function ( req, res ) { },


			del: function ( req, res ) {
				var id = req.params.id
				models.user.del( id, function ( err ) {
					if ( err ) return res.status( 400 ).send()
					res.send()
				})
			},


			list: function ( req, res ) {
				models.user.all( function ( err, all ) {
					if ( err ) return res.status( 500 ).send()
					var users = all.map( toJSON )
					res.send( { users: users } )
				})
			}
		}

	}


}
