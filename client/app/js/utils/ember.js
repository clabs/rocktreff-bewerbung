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
define([

	'ember'

], function ( Ember ) { 'use strict';

	Ember.computed.groupBy = function ( dependentKey, propertyKey ) {
		return Ember.arrayComputed( dependentKey, {
			initialValue: Ember.A([{
				key: undefined,
				values: Ember.A()
			}]),
			addedItem: function ( array, item ) {
				var value = item.get( propertyKey )
				var group = array.findBy( 'key', value )
				if ( !group ) {
					group = Ember.Object.create({
						key: value,
						values: Ember.A(),
					})
					array.pushObject( group )
				}
				group.values.pushObject( item )
				return array
			},
			removedItem: function ( array, item ) {
				var value = item.get( propertyKey )
				array.map( function ( group )  {
					group.values.removeObject( item )
				})
				return array
			}
		})
	}
})
