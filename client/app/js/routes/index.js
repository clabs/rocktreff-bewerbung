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
			if ( !this.auth.signedIn )
				this.redirectToLogin( transition )
		},

		redirectToLogin: function ( transition ) {
			var loginController = this.controllerFor( 'login' )
			loginController.set( 'attemptedTransition', transition )
			this.transitionTo( 'login' )
		},

		actions: {
			error: function ( err, transition ) {
				if ( err.status === 401 )
					this.redirectToLogin ( transition )
				else if ( err.status === 403 )
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


	BB.ApplicationRoute = BB.HomeRoute = BB.CrewRoute = BB.Route.extend({

		setupController: function ( controller ) {
			// init user model
			if ( this.auth.token ) {
				this.auth.setUserModel( this.store.find( 'user', this.auth.token.user ) )
			}
			// fetch events
			this.store.findAll( 'event' ).then( function ( events ) {
				BB.set( 'events', events )
			})
			// prefetch regions
			this.store.findAll( 'region' ).then( function ( regions ) {
				BB.set( 'regions', regions )
			})

		},

		actions: {
			logout: function () {
				this.auth.logout()
				this.transitionTo( 'index' )
			}
		}

	})



	BB.NewBidRoute = BB.AuthenticatedRoute.extend({
		model: function () {
			return this.store.createRecord( 'bid', {
				user: this.auth.user,
				event: BB.get( 'events.firstObject' )
			}).save()
		},

		actions: {
			error: function ( err, transition ) {
				if ( err.status === 409 ) {
					var self = this
					this.store.find( 'bid', {
							user: this.auth.user.id,
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

	BB.SignupRoute = BB.Route.extend({
		actions: {
			signup: function () {
				var self = this
				var controller = this.get( 'controller' )
				var credentials = controller.getProperties( 'email', 'password' )
				var user = this.store.createRecord( 'user', {
					name: '',
					provider: 'local',
					role: '',
					email: credentials.email,
					password: credentials.password
				})
				user.save()
					.then( function () {
						return self.auth.authenticateViaLocal( credentials )
					})
					.then( function () {
						self.transitionTo( 'home' )
					})
			}
		}
	})




	BB.BidRoute = BB.AuthenticatedRoute.extend({
		model: function ( params ) {
			return this.store.find( 'bid', params.bid_id )
		}
	})



	BB.BidsRoute = BB.AuthenticatedRoute.extend({
		model: function ( params ) {
			var id = params.track_id
			return this.store.findQuery( 'bid', { track: id } )
		}

	})


	BB.BidsUnassignedRoute = BB.AuthenticatedRoute.extend({
		model: function ( params ) {
			return this.store.find( 'bid', { track: '' } )
		}
	})



	BB.BidDetailsRoute = BB.AuthenticatedRoute.extend({
		setupController: function ( controller, model ) {
			this._super( controller, model )
			this.store.find( 'track' ).then( function ( tracks ) {
				controller.set( 'tracks', tracks )
			})
		}
	})

	BB.AnalysisRoute = BB.ExportRoute = BB.AuthenticatedRoute.extend({
		model: function () {
			return this.store.findAll( 'bid' )
		}
	})



	BB.EventsRoute = BB.AuthenticatedRoute.extend({
		model: function () {
			return this.store.find( 'event' )
		}
	})



	BB.EventsNewRoute = BB.AuthenticatedRoute.extend({
		model: function () {
			return this.store.createRecord( 'event' )
		},

		actions: {
			abort: function () {},
			save: function ( event ) {
				var self = this
				event.save().then( function () {
					self.transitionTo( 'events' )
				})
			}
		}
	})



	BB.EventEditRoute = BB.AuthenticatedRoute.extend({
		model: function ( params ) {
			return this.store.find( 'event', params.event_id )
		},
		setupController: function ( controller, model ) {
			controller.set( 'content', model )
		},
		renderTemplate: function () {
			this.render( 'events/edit' )
		},
		actions: {
			abort: function ( event ) {
				var self = this
				event.reload().then( function () {
					self.transitionTo( 'events' )
				})
			},
			save: function ( event ) {
				var self = this
				event.save().then( function () {
					self.transitionTo( 'events' )
				})
			}
		}
	})



	BB.UsersRoute = BB.AuthenticatedRoute.extend({
		model: function () {
			return this.store.find( 'user' )
		},

		actions: {
			promoteUser: function ( user ) {
				var role = user.get( 'role' )
				var new_role = role === 'crew' ? 'admin' : 'crew'
				user.set( 'role', new_role )
				user.save()
			},
			demoteUser: function ( user ) {
				var role = user.get( 'role' )
				var new_role = role === 'admin' ? 'crew' : ''
				user.set( 'role', new_role )
				user.save()
			}

		},

	})

})
