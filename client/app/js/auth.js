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

], function () { 'use strict';

	var VERSION = '0.0.5'
	var NAME = 'Rocktreff-Auth'
	var RT = ( window.RT = window.RT || Ember.Namespace.create() )
	var $APP

	RT.Auth = Ember.Object.extend({

		toString: function () { return NAME },
		version: VERSION,
		hostname: null,

		user: null,
		userId: null,
		sessionId: null,
		sessionTimestamp: null,
		token: null,

		facebook_redirect_uri: null,
		facebook_client_id: null,

		signedIn: Ember.computed.notEmpty( 'user' ),

		init: function () {
			var token
			try {
				token = JSON.parse( window.localStorage.token )
			} catch ( e ) {
				token = null
			} finally {
				this.set( 'token', token )
				this._persistToken()
				this._addBearerHeader()
			}
		},

		setUserModel: function ( promise ) {
			return promise.then( function ( user ) {
				return this.set( 'user', user )
			}.bind( this ) )
		},

		// different strategies …
		authenticateViaLocal: function ( credentials ) {
			return this._authenticate( credentials )
		},

		authenticateViaFacebook: function () {
			var url = buildURI( 'https://www.facebook.com/dialog/oauth', [
				[ 'response_type', 'code', ],
				[ 'redirect_uri', this.get( 'facebook_redirect_uri' ) ],
				[ 'scope', 'email' ],
				[ 'client_id', this.get( 'facebook_client_id' ) ],
				[ 'type', 'web_server' ],
				[ 'display', 'popup' ],
			])
			return this._oauth( url )
		},


		logout: function () {
			return new Ember.RSVP.Promise( function ( fulfill ) {
				this.set( 'token', null )
				delete window.localStorage.token
				fulfill()
			}.bind( this ) )
		},





		// internals
		_persistToken: function () {
			var token = this.get( 'token' )
			if ( !token || !token.user || !token.timestamp ) {
				delete window.localStorage.token
				this.setProperties({
					sessionId: null,
					sessionTimestamp: null,
					signedIn: false,
					token: null,
					user: null,
					userId: null
				})
			}
			else {
				this.setProperties({
					sessionId: token.id,
					sessionTimestamp: new Date( token.timestamp ),
					signedIn: true,
					// token: (already set)
					// user: (will be set by the app)
					userId: token.user,
				})
				// persist to storage
				try {
					window.localStorage.token = JSON.stringify( token )
				}
				catch ( e ) {
					throw new Ember.Error( 'Could not persist user session token to localStorage.' )
				}
			}
		}.observes( 'token' ),


		_addBearerHeader: function () {
			var sessionID = this.get( 'sessionId' )
			var adapter = $APP.__container__.lookup( 'adapter:application' )
			var headers = { Authorization: 'Bearer ' + sessionID }
			if ( !sessionID || !adapter ) return
			Ember.Logger.debug( 'adding headers to '+adapter, headers )
			adapter.headers = headers
		}.observes( 'sessionId' ),


		_authenticate: function ( credentials ) {
			return Ember.$.ajax({
				url: this.get( 'host' ) + '/auth/local',
				type: 'POST',
				data: credentials
			}).then( function ( data ) {
				this.set( 'token', data.token )
			}.bind( this ) )
		},


		_authenticateWithToken: function ( token ) {
			return new Ember.RSVP.Promise( function ( fulfill ) {
				this.set( 'token', token )
				fulfill( token )
			}.bind( this ) )
		},


		_oauth: function ( url ) {
			var self = this
			return new Ember.RSVP.Promise( function ( fulfill, reject ) {
				window.addEventListener( 'message', function receiveToken ( event ) {
					if ( event.origin !== self.get( 'host' ) ) return
					try {
						var token = JSON.parse( event.data )
						self._authenticateWithToken( token ).then( function () {
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
		}

	})


	// inject into Ember.Applications
	Ember.onLoad( 'Ember.Application', function ( Application ) {
		Application.initializer({
			name: 'rocktreff-auth',
			initialize: function ( container, app ) {
				$APP = app // remember the application object
				var auth = app.get( 'Auth' ) || RT.Auth
				app.register( 'auth:main', auth , { instantiate: true, singleton: true } )
				app.inject( 'route', 'auth', 'auth:main' )
				app.inject( 'controller', 'auth', 'auth:main' )
				return app.inject( 'view', 'auth', 'auth:main' )
			}
		})
		if ( Ember.libraries ) Ember.libraries.register( NAME, VERSION )
		return Application.initializer({
			name: 'rocktreff-auth-load',
			after: 'rocktreff-auth',
			initialize: function ( container, app ) {
				return container.lookup( 'auth:main' )
			}
		})
	})


	// helpers
	var buildURI = function ( baseurl, options ) {
		return baseurl + '?' + options.map( function ( opt ) {
			return opt.map( window.encodeURIComponent ).join( '=' )
		}).join ( '&' )
	}


	return RT.Auth
})
