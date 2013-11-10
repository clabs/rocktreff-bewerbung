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

var TTL = 86400000 // one day
var UPDATE_INTERVAL = 60000 // one minute

// setup collection
var collection = store( 'tokens' )

var Tokens = {

	verify: function ( id ) {
		return new Promise( function ( resolve, reject ) {
			if ( collection.has( id ) ) {
				var token = collection.get( id )
				resolve( token )
			} else {
				reject()
			}
		}).then( this.update )
	},


	update: function ( token ) {
		token.timestamp = +( new Date() )
		return new Promise( function ( resolve, reject ) {
			collection.set( token.id, token, function ( err ) {
				if ( err ) reject( err )
				else resolve( token )
			})
		})
	},


	create: function ( user ) {
		var self = this
		return this.forUser( user ).then( function ( token ) {
			if ( token ) return self.update( token )
			else {
				var token = { user: user.id }
				do { token.id = guid( 48 ) }
				while ( collection.has( token.id ) )
				token.timestamp = +( new Date() )
				return new Promise( function ( resolve, reject ) {
					collection.set( token.id, token, function ( err ) {
						if ( err ) reject( err )
						else resolve( token )
					})
				})
			}
		})
	},


	forUser: function ( user ) {
		var query = { user: user.id }
		return new Promise( function ( resolve, reject ) {
			collection.all( function ( err, tokens ) {
				if ( err ) reject( err )
				else {
					var user =_.filter( tokens || [], query )[ 0 ]
					resolve( user )
				}
			})
		})
	},


	all: function () {
		return new Promise( function ( resolve, reject ) {
			collection.all( function ( err, tokens ) {
				if ( err ) reject( err )
				else resolve( _.map( tokens || [] ) )
			})
		})
	},


	prune: function () {
		var now = +( new Date() )
		this.all().then( function ( tokens ) {
			if ( now - TTL > token.timestamp )
			collection.remove( token.id )
		})
	}
}

setInterval( Tokens.prune.bind( Tokens ), UPDATE_INTERVAL )
exports = module.exports = Tokens

