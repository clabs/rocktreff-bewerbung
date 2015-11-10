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

var _ = require( 'lodash' )
var Promise = require( 'promise' )

var irregular_plurals = {
	media: 'media'
}

function pluralize ( key, obj ) {
	return key in irregular_plurals ?
		irregular_plurals[ key ] :
		key + 's'
}

exports = module.exports = {

	sideload: function ( res, key, obj ) {
		if ( !obj ) return
		var value
		var locals = res.locals
		var sideloads = locals.sideloads = locals.sideloads || {}
		sideloads[ key ] = sideloads[ key ] || []
		if ( obj instanceof Array ) {
			sideloads[ key ] = sideloads[ key ].concat( obj )
			// sideloads[ key ] = _.uniq( sideloads[ key ], function ( item ) {
			// 	return item.id || item
			// })
		}
		else {
			sideloads[ key ].push( obj )
		}
	},

	send: _.curry( function ( key, res, obj ) {
		obj = obj || []
		var json = {}
		// inject sideloads
		var sideloads = res.locals.sideloads || {}
		_.each( sideloads, function ( value, key ) {
			if ( !value || value.length === 0 ) return
			json[ pluralize( key ) ] = value
		})
		// add the main obj
		json[ pluralize( key ) ] = obj
		// send the result
		res.send( json )
	}),


	forEach: function ( type, json, callback ) {
		var self = this
		return new Promise( function ( fulfill, reject ) {
			var items = self.extractItemsByType( type )
			fulfill( items )
		})
		.then( function ( items ) {
			new Promise.all( items.map( callback ) )
		})
	},

	extractItemsByType: function ( type, json ) {
		// singular
		if ( json.hasOwnProperty( type ) ) {
			var item = json[ type ]
			return this.removeNullProperties( item )
		}
		// plural
		if ( json.hasOwnProperty( type + 's' ) ) {
			var items = json[ type + 's' ]
			return this.removeNullProperties( items )
		}
	},

	removeNullProperties: function ( items ) {
		if ( !( items instanceof Array ) ) items = [ items ]
		return items.map( function ( item ) {
			for ( var key in item ) {
				if ( item[key] === null )
					delete item[key]
			}
		})
	}
}
