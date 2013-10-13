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
			return new Promise( function ( resolve, reject ) {
				collection.all( function ( err, items ) {
					if ( err ) reject( err )
					else resolve( _.filter( items || [], query ) )
				})
			})
		},


		all: function () {
			return new Promise( function ( resolve, reject ) {
				collection.all( function ( err, items ) {
					if ( err ) reject( err )
					else resolve( _.map( items || [] ) )
				})
			})
		},


		get: function ( id ) {
			return new Promise( function ( resolve, reject ) {
				collection.get( id, function ( err, item ) {
					if ( err ) reject( err )
					else resolve( item )
				})
			})
		},


		set: function ( id, item ) {
			if ( !item.id ) item.id = id
			item.modified = ( new Date() ).toISOString()
			return new Promise( function ( resolve, reject ) {
				collection.set( id, item, function ( err ) {
					if ( err ) reject( err )
					else resolve( item )
				})
			})

		},


		create: function ( item ) {
			do { item.id = guid() }
			while ( collection.has( item.id ) )
			item.created = ( new Date() ).toISOString()
			return new Promise( function ( resolve, reject ) {
				collection.set( item.id, item, function ( err ) {
					if ( err ) reject( err )
					else resolve( item )
				})
			})

		},


		del: function ( id ) {
			return new Promise( function ( resolve, reject ) {
				if ( !collection.has( id ) ) reject( new Error( 'unknown' ) )
				collection.remove( id, function ( err ) {
					if ( err ) reject( err )
					else resolve()
				})
			})

		},

		has: function ( id ) {
			return collection.has( id )
		}
	}
}
