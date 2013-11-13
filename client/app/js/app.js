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
	var HOSTNAME = 'https://api.rocktreff.de'

	BB.reopen({

		hostname: HOSTNAME,

		token: null,

		user: function () {
			var token = this.get( 'token' )
			// update user model
			if ( token && token.user ) {
				return BB.User.find( token.user )
			} else {
				return null
			}
		}.property( 'token' ),



		observeToken: function () {
			var token = this.get( 'token' )
			// persist to storage
			storage.token = JSON.stringify( token )
			// update user model
			this.updateUser( token )
		}.observes( 'token' ),


		updateUser: function ( token ) {
			// update user model
			if ( token && token.user ) {
				try {
					return BB.User.fetch( token.user )
					.then( function ( user ) {
						BB.set( 'user', user )
					})
				} catch ( e ) {}
			} else {
				BB.set( 'user', null )
			}
		},

		Client: RL.Client.create({
			adapter: BB.RESTAdapter.create({
				url: HOSTNAME,
				tokenBinding: 'BB.token.id',
			})
		}),

		auth: Ember.Object.create({

			authenticate: function ( credentials ) {
				var adapter = BB.get( 'Client.adapter' )
				return adapter.request( null, {
					url: adapter.get( 'url' ) + '/auth/local',
					type: 'POST',
					data: credentials
				}).then( function ( data ) {
					BB.set( 'token', data.token )
				})
			},

			authenticateWithToken: function ( token ) {
				return new Ember.RSVP.Promise( function ( fulfill ) {
					BB.set( 'token', token )
					fulfill( token )
				})
			},

			logout: function () {
				return new Ember.RSVP.Promise( function ( fulfill ) {
					BB.set( 'token', null )
					delete storage.token
					BB.__container__.lookup( 'router:main' ).transitionTo( 'home' )
					fulfill( token )
				})
			}

		}),

		userExists: function () {
			return !!this.get( 'user' )
		}.property( 'user' ),


		ready: function () {
			// fetch current event
			BB.Event.fetch()
				.then( function ( events ) {
					BB.set( 'currentEvent', events.get( 'firstObject' ) )
				})
			// fetch all regions
			BB.Region.fetch()
				.then( function ( regions ) {
					BB.set( 'regions', regions )
				})
			// fetch all Bids
			if ( BB.user )
			BB.Bid.fetch()
				.then( function ( bids ) {
					BB.set( 'bids', bids )
				})
			// update user
			var user = this.get( 'user' )
			if ( user && !user.saveRecord ) {
				user = BB.User.create( user )
				user.set( 'isNew', false )
				this.set( 'user', user )
			}
		},

		currentBid: function () {
			var bids = this.get( 'bids' )
			var id = this.get( 'currentEvent.id' )
			if ( bids && id )
				return bids.filterBy( 'event', id ).get( 'firstObject' )
			else
				return false
		}.property( 'bids', 'currentEvent', 'user' ),

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



	var token = JSON.parse( storage.token || 'null' )
	if ( token ) {
		Ember.$.ajax({
			url: HOSTNAME + '/users/' + token.user,
			type: 'GET',
			beforeSend: function ( xhr ) {
				xhr.setRequestHeader( 'Authorization', 'Bearer ' + token.id )
			}
		})
		.then( function ( data ) {
			var user = data.user
			BB.set( 'token', token )
			BB.set( 'user', user )
			BB.advanceReadiness()
		}, function () {
			BB.set( 'user', null )
			BB.set( 'token', null )
			BB.advanceReadiness()
		})
	} else {
		BB.advanceReadiness()
	}



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


	BB.Client.adapter.configure( 'plurals', {
		media: 'media'
	})



})
