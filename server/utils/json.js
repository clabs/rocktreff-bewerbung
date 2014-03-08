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


function createFromSchema( schema ) {
	var obj = {}
	if ( !schema || !schema.properties ) return obj
	var properties = schema.properties
	for ( var key in properties ) {
		if ( !properties.hasOwnProperty( key ) ) continue
		var property = properties[ key ]
		switch ( property.type.toLowerCase() ) {
			case 'object':
				obj[ key ] = createFromSchema( property.properties )
			case 'string':
				obj[ key ] = property.default || ''
			case 'array':
				obj[ key ] = property.default || []
			case 'boolean':
				obj[ key ] = property.default || false
			case 'number':
				obj[ key ] = property.default || 0
		}
	}
	return obj
}

module.exports = function ( template ) {

	template = createFromSchema( template )

	return {
		create: function ( obj ) {
			return new Promise( function ( resolve ) {
				resolve( _.defaults( obj, template ) )
			})
		},


		omit: function () {
			var args = Array.prototype.slice.call( arguments )
			return function ( obj ) {
				var foo = obj instanceof Array ?
					_.map( obj, function ( o ) {
						return _.omit( o, args )
					})
					: _.omit( obj, args )
				return foo
			}
		},


		merge: _.curry( function ( src, obj ) {
			return _.merge( obj, src )
		})

	}
}
