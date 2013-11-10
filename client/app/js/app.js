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

	'bb',
	'models/models',
	'store/adapter',

], function ( BB ) {

	'use strict';

	var storage = window.localStorage

	BB.reopen({

		Client: RL.Client.create({
			adapter: BB.RESTAdapter.create()
		}),

		auth: Ember.Object.create({

			user: null,

			token: JSON.parse( storage.token || 'null' ),
			setToken: function ( token ) {
				this.set( 'token', token )
				// persist to storage
				storage.token = JSON.stringify( token )
				// update user model
				this.updateUser( token )
			}.observes( 'token' ),


			init: function () {
				var token = this.get( 'token' )
				this.updateUser( token )
			},

			updateUser: function ( token ) {
				var self = this
				Ember.run.later( function () {
					// update user model
					if ( token && token.user ) {
						var user = BB.User.find( token.user )
						self.set( 'user', user )
					} else {
						self.set( 'user', null )
					}
				}, 0 )
			},


			authenticate: function ( credentials ) {
				var self = this
				var adapter = BB.get( 'Client.adapter' )
				return adapter.request( null, {
					url: adapter.get( 'url' ) + '/auth/local',
					type: 'POST',
					data: credentials
				}).then( function ( data ) {
					self.setToken( data.token )
				})
			},


			authenticateWithToken: function ( token ) {
				var self = this
				return new Ember.RSVP.Promise( function ( fulfill ) {
					self.setToken( token )
					fulfill( token )
				})
			},


			logout: function () {
				var self = this
				return new Ember.RSVP.Promise( function ( fulfill ) {
					self.setToken( null )
					delete storage.token
					fulfill( token )
				})
			}

		}),

		userExists: function () {
			return !!this.get( 'auth.user' )
		}.property( 'auth.user' ),


		// a basic example for observing properties
		titleChanged: function () {
			var title = ''
			if ( this.get( 'title' ) )
				title += this.get( 'title' ) + ' - '
			title += 'Rocktreff Bandbewerbung'
			$( 'title' ).text( title )
			// chrome bug workaround see: http://stackoverflow.com/questions/2952384/changing-the-window-title-when-focussing-the-window-doesnt-work-in-chrome
			Ember.run.later( function () {
				document.title = '.'
				document.title = title
			}, 200 )
		}.observes( 'title' )

	})

	Ember.run.later( function () {
		BB.Event.fetch()
		.then( function ( events ) {
			BB.set( 'currentEvent', events.get( 'firstObject' ) )
		})
	}, 0 )



	BB.Client.adapter.registerTransform( 'isodate', {
		deserialize: function ( datestring ) {
			return new Date( datestring )
		},
		serialize: function ( obj ) {
			if ( typeof obj === 'string' )
				return ( new Date( obj ) ).toISOString()
			if ( typeof obj === 'date' )
				return obj.toISOString()
			else
				return obj.toString()
		}
	})

	BB.Client.adapter.registerTransform( 'object', {
		deserialize: function ( string ) {
			return JSON.parse( string || 'null' )
		},
		serialize: function ( obj ) {
			return JSON.stringify( obj || null )
		}
	})


})
