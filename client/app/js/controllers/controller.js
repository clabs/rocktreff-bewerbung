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

	'bb'

], function ( BB ) {

	'use strict';

	BB.AnalysisController = BB.ExportController = Ember.ArrayController.extend({

		byTracks: Ember.arrayComputed( 'content', {
			initialValue: Ember.A(),
			addedItem: function ( array, item ) {
				var track = item.get( 'track' )
				var group = array.findBy( 'track', track )
				if ( !group ) {
					group = Ember.Object.create({
						track: track,
						values: Ember.ArrayProxy.createWithMixins( Ember.SortableMixin, {
							sortProperties: [ 'score' ],
							sortAscending: false,
							content: Ember.A()
						}),
					})
					array.pushObject( group )
				}
				group.values.pushObject( item )
				return array
			},
			removedItem: function ( array, item ) {
				array.map( function ( group )  {
					group.values.removeObject( item )
				})
				return array
			}
		})



	})

	BB.UsersController = Ember.ArrayController.extend({
		searchstring: '',

		filteredUsers: function () {
			var search = this.get( 'searchstring' ).toLowerCase()
			var users = this.get( 'content' )
			if ( !search || search === '' || search.length < 3 ) {
				return []
			} else {
				return users.filter( function ( user ) {
					var string = user.get( 'displayName' ) + user.get( 'email' )
					return string.toLowerCase().indexOf( search ) >= 0
				})
			}
		}.property( 'searchstring' )
	})


	BB.EventController = Ember.ArrayController.extend({

		currentEvent: function () {
			return this.get( 'content.firstObject' )
		}.property( 'content' )

	})

	BB.EventEditController = Ember.ObjectController.extend({

		trackname: null,

		actions: {
			addTrack: function () {
				var evt = this.get( 'content' )
				var name = this.get( 'trackname' )
				var track = this.store.createRecord( 'track', {
					event: evt,
					name: name
				})
				track.save().then( function () {
					evt.get( 'tracks' ).addObject( track )
				})
				this.set( 'trackname', '' )
			},

			removeTrack: function ( track ) {
				var evt = this.get( 'content' )
				if ( window.confirm( 'Really delete this track?' )  ) {
					track.deleteRecord()
					track.save().then( function () {
						evt.get( 'tracks' ).removeObject( track )
					})
				}
			}
		}

	})

	BB.LightboxController = Ember.Controller.extend({

		picture: null,

		actions: {
			show: function ( picture ) {
				this.set( 'picture', picture )
			},
			hide: function () {
				this.set( 'picture', null )
			}
		}

	})

})
