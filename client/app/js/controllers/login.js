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
	'jquery',

	'models/models'

], function ( BB, $ ) {

	'use strict';



	BB.LoginController = Ember.ObjectController.extend({


		tokenBinding: 'BB.RESTAdapter.accesstoken',
		attemptedTransition: null,
		email: '',
		password: '',


		reset: function () {
			this.setProperties({
				email: null,
				password: null,
			})
		},

		init: function () {
			this.tokenChanged()
			this._super()
		},


		tokenChanged: function ( token ) {
			token = !token ? this.get( 'token' ) : token.token || token
			if ( token ) {
				var user = BB.User.find( token.user )
				BB.set( 'user', user )
			}
		}.observes( 'token' ),


		transitionBack: function () {
			var self = this
			var attemptedTransition = this.get( 'attemptedTransition' )
			Ember.run.later( function () {
				if ( attemptedTransition ) {
					attemptedTransition.retry()
					self.set( 'attemptedTransition', null )
				} else {
					BB.__container__.lookup( 'router:main' ).transitionTo( 'home' )
				}
			}, 1000 )
		},


		authLocal: function () {
			var credentials = this.getProperties( 'email', 'password' )
			return BB.auth.authenticate( credentials )
		},


		authFacebook: function () {
			var url = 'https://www.facebook.com/dialog/oauth?&response_type=code&redirect_uri=https%3A%2F%2Fapi.rocktreff.de%2Fauth%2Ffacebook%2Fcallback&scope=email&client_id=528637637210887&type=web_server&display=popup'
			return this.oauth( url )
		},


		authTwitter: function () {
			var url = BB.get( 'hostname' ) + '/auth/twitter/callback'
			return this.oauth( url )
		},


		oauth: function ( url ) {
			return new Ember.RSVP.Promise( function ( fulfill, reject ) {
				var adapter = BB.Client.get( 'adapter' )
				var origin = adapter.get( 'url' )
				window.addEventListener( 'message', function receiveToken ( event ) {
					if ( event.origin !== origin ) return
					try {
						var token = JSON.parse( event.data )
						BB.auth.authenticateWithToken( token ).then( function () {
							fulfill( token )
						})
					} catch ( e ) {
						reject( e )
					} finally {
						window.removeEventListener( 'message', receiveToken )
					}
				}, false )
				window.open( url, 'authwindow', 'centerscreen=true,width=445,height=480,menubar=no' )
			})
		},


		actions: {
			auth: function ( strategy ) {
				var self = this
				var transitionBack = function () {
					self.transitionBack()
				}
				switch ( strategy ) {
					case 'local':
						return this.authLocal().then( BB.setupUser ).then( transitionBack )
					case 'facebook':
						return this.authFacebook().then( BB.setupUser ).then( transitionBack )
					case 'twitter':
						return this.authTwitter().then( BB.setupUser ).then( transitionBack )
					default:
						return new Ember.RSVP.Promise( function ( _, reject ) {
							reject( new Error( 'unknown auth strategy' ) )
						})
				}
			}
		}

	})







	BB.SignupController = Ember.ObjectController.extend({
		email: null,
		password: null,
		password_repeat: null,
		privacy_checked: false,

		init: function () {
			this.reset()
			this._super()
		},

		reset: function () {
			this.setProperties({
				email: '',
				password: '',
				password_repeat: ''
			})
		},

		// email validations
		email_valid: function () {
			var regexp = /^[A-Za-z0-9](([_\.\-]?[a-zA-Z0-9]+)*)@([A-Za-z0-9]+)(([\.\-]?[a-zA-Z0-9]+)*)\.([A-Za-z]{2,})$/
			var email = this.get( 'email' )
			if ( !email || email === '' ) return false
			return regexp.test( email )
		}.property( 'email' ),
		email_invalid: function () {
			var email = this.get( 'email' )
			return email && email !== '' && !this.get( 'email_valid' )
		}.property( 'email_valid' ),


		// password validations
		password_valid:  function () {
			var a = this.get( 'password' )
			var b = this.get( 'password_repeat' )
			return a && a !== '' && a === b
		}.property( 'password', 'password_repeat' ),


		incomplete: function () {
			return !this.get( 'password_valid' ) ||
			       !this.get( 'email_valid' ) ||
			       !this.get( 'privacy_checked' )
		}.property( 'password_valid', 'email_valid', 'privacy_checked' ),

		actions: {
			signup: function () {
				var credentials = this.getProperties( 'email', 'password' )
				var user = BB.User.create({
					name: '',
					provider: 'local',
					role: '',
					email: credentials.email,
					password: credentials.password
				}).saveRecord()
				.then( function () {
					return BB.auth.authenticate( credentials )
				})
				.then( function () {
					BB.__container__.lookup( 'router:main' ).transitionTo( 'home' )
				})
			}
		}
	})


})
