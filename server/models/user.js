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

var store = require( '../store' )
var guid = require( '../utils/guid' )
var _ = require( 'lodash' )

exports = module.exports = function ( app ) {

	// setup users collection
	var users = store( 'users' )

	return {

		/**
		 * find a user
		 * @param  {Object}   query    [description]
		 * @param  {Function} done     [description]
		 */
		find: function ( query, done ) {
			users.all( function ( err, data ) {
				var user = _.find( data, query )
				if ( err )
					return done( err, null )
				if ( !user )
					return done( 'User not found. (Query: '+ query+')', null )
				return done( null, user )
			})
		},


		get: function ( id, done ) {
			return users.get( id, function ( err, user ) {
				done( null, user )
			})
		},


		set: function ( id, user, done ) {
			users.set( id, user, function ( err ) {
				if ( err ) return done( err, null )
				return done( null, user )
			})
		},


		create: function ( user, done ) {
			var id = guid()
			user.id = id
			users.set( id, user, function ( err ) {
				if ( err ) return done( err, null )
				return done( null, user )
			})
		}
	}
}
