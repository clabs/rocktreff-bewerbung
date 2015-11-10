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
var Promise = require( 'promise' )

exports = module.exports = function ( name ) {
	// setup collection
	var collection = store( name )

	return {

		find: function ( query ) {
			if ( !query || _.isEmpty( query ) )
				return this.all()
			return new Promise( function ( fulfill, reject ) {
				collection.all( function ( err, items ) {
					if ( err ) reject( err )
					else fulfill( _.filter( items || [], query ) )
				})
			})
		},


		all: function () {
			return new Promise( function ( fulfill, reject ) {
				collection.all( function ( err, items ) {
					if ( err ) reject( err )
					else fulfill( _.map( items || [] ) )
				})
			})
		},


		get: function ( id ) {
			return new Promise( function ( fulfill, reject ) {
				collection.get( id, function ( err, item ) {
					if ( err ) reject( err )
					else fulfill( item )
				})
			})
		},


		set: function ( id, item ) {
			if ( !item.id ) item.id = id
			item.modified = ( new Date() ).toISOString()
			return new Promise( function ( fulfill, reject ) {
				collection.set( id, item, function ( err ) {
					if ( err ) return reject( err )
					else fulfill( item )
				})
			})

		},


		create: function ( item ) {
			do { item.id = guid( 15 ) }
			while ( collection.has( item.id ) )
			item.created = ( new Date() ).toISOString()
			return new Promise( function ( fulfill, reject ) {
				collection.set( item.id, item, function ( err ) {
					if ( err ) reject( err )
					else fulfill( item )
				})
			})

		},


		save: function ( obj ) {
			var self = this
			return this.get( obj.id )
				.then( function ( item ) {
					return _.merge( item, obj )
				})
				.then( function ( item ) {
					return self.set( item.id, item )
				})
		},


		del: function ( id ) {
			return new Promise( function ( fulfill, reject ) {
				if ( !collection.has( id ) ) reject( new Error( 'unknown' ) )
				collection.remove( id, function ( err ) {
					if ( err ) reject( err )
					else fulfill()
				})
			})

		},

		has: function ( id ) {
			return collection.has( id )
		}
	}
}
