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
	'models/models'

], function ( BB ) {

	'use strict';

	BB.Route = Ember.Route.extend({
		enter: function () {
			window.scrollTo( 0, 0 )
		}
	})

	BB.AuthenticatedRoute = BB.Route.extend({

		beforeModel: function ( transition ) {
			if ( !BB.user )
				this.redirectToLogin( transition )
		},

		redirectToLogin: function ( transition ) {
			var loginController = this.controllerFor( 'login' )
			loginController.set( 'attemptedTransition', transition )
			this.transitionTo( 'login' )
		},

		actions: {
			error: function ( err, transition ) {
				if ( err.status == 401 )
					this.redirectToLogin ( transition )
				else if ( err.status == 403 )
					this.transitionTo( 'no' )
				else {
					this.transitionTo( 'home' )
					console.error( err )
					throw err
				}
			}
		}
	})


	BB.IndexRoute = BB.Route.extend({
		redirect: function () {
			this.transitionTo( 'home' )
		}
	})


	BB.ApplicationRoute = BB.Route.extend({

		actions: {
			logout: function () {
				BB.auth.logout()
				this.transitionTo( 'index' )
			}
		}

	})



	BB.NewBidRoute = BB.AuthenticatedRoute.extend({

		model: function () {
			return BB.Bid.create({
				user: BB.get( 'user.id' ),
				event: BB.get( 'currentEvent.id' )
			}).saveRecord()
		},

		actions: {
			error: function ( err, transition ) {
				if ( err.status === 409 ) {
					var self = this
					BB.Bid
						.fetch({
							user: BB.get( 'user.id' ),
							event: BB.get( 'currentEvent.id' )
						})
						.then( function ( bids ) {
							var bid = bids.get( 'firstObject' )
							self.transitionTo( 'bid', bid )
						}, function ( err ) {
							self._super( err, transition )
						})
				}
				else this._super( err, transition )
			}
		}
	})




	BB.BidRoute = BB.AuthenticatedRoute.extend({})



	BB.EventsRoute = BB.AuthenticatedRoute.extend({
		model: function () {
			return BB.Event.fetch()
		}
	})



	BB.EventsNewRoute = BB.AuthenticatedRoute.extend({
		model: function () {
			return BB.Event.create()
		},
		renderTemplate: function () {
			this.render( 'events/edit', {
				outlet: 'event'
			})
		},

		actions: {
			abort: function () {},
			save: function ( event ) {
				var self = this
				event.saveRecord().then( function () {
					self.transitionTo( 'events' )
				})
			}
		}
	})



	BB.EventEditRoute = BB.AuthenticatedRoute.extend({
		model: function ( params ) {
			return BB.Event.fetch( params.event_id )
		},
		renderTemplate: function () {
			this.render( 'events/edit', {
				outlet: 'event'
			})
		},
		actions: {
			abort: function ( event ) {
				var self = this
				event.reloadRecord().then( function () {
					self.transitionTo( 'events' )
				})
			},
			save: function ( event ) {
				var self = this
				event.saveRecord().then( function () {
					self.transitionTo( 'events' )
				})
			}
		}
	})



	BB.UsersRoute = BB.AuthenticatedRoute.extend({
		model: function () {
			return BB.User.fetch()
		},

		actions: {
			promoteUser: function ( user ) {
				var role = user.get( 'role' )
				var new_role = role === 'crew' ? 'admin' : 'crew'
				user.set( 'role', new_role )
				user.saveRecord()
			},
			demoteUser: function ( user ) {
				var role = user.get( 'role' )
				var new_role = role === 'admin' ? 'crew' : ''
				user.set( 'role', new_role )
				user.saveRecord()
			}

		},

	})

})
