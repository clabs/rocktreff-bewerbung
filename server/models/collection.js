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

exports = module.exports = function ( name ) {
	// setup collection
	var collection = store( 'users' )
	return {

		find: function ( query, done ) {
			collection.all( function ( err, data ) {
				var item = _.find( data, query )
				if ( err ) return done( err, null )
				return done( null, item )
			})
		},


		all: function ( done ) {
			if ( !done ) return _.map( collection.all() )
			collection.all( function ( err, all ) {
				if ( err ) return done( err, null )
				return done( null, _.map( all ) )
			})
		},


		get: function ( id, done ) {
			if ( !done ) return collection.get( id )
			return collection.get( id, function ( err, item ) {
				done( null, item )
			})
		},


		set: function ( id, item, done ) {
			if ( !done ) collection.set( id, item )
			collection.set( id, item, function ( err ) {
				if ( err ) return done( err, null )
				return done( null, item )
			})
		},


		create: function ( item, done ) {
			var id = guid()
			item.id = id
			collection.set( id, item, function ( err ) {
				if ( err ) return done( err, null )
				return done( null, item )
			})
		}
	}
}
