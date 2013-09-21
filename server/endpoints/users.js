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
	var toJSON = function ( user ) {
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			created: user.created,
			rights: user.rights,
			events: user.events
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
			put: function ( req, res ) { },
			del: function ( req, res ) { },
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
