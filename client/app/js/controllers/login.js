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

		email: '',
		password: '',
		reset: function () {
			this.setProperties({
				email: null,
				password: null,
			})
		},


		attemptedTransition: null,
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



		actions: {
			auth: function ( strategy ) {
				var auth = this.get( 'auth' )
				var credentials = this.getProperties( 'email', 'password' )
				var transitionBack = this.transitionBack.bind( this )
				if ( strategy === 'local' )
					return auth.authenticateViaLocal( credentials ).then( transitionBack )
				else if ( strategy === 'facebook' )
					return auth.authenticateViaFacebook().then( transitionBack )
				else
					return new Ember.RSVP.Promise( function ( _, reject ) {
						reject( new Ember.Error( 'unknown auth strategy' ) )
					})
			}
		}

	})







	BB.SignupController = Ember.ObjectController.extend({
		email: null,
		password: null,
		password_repeat: null,
		privacy_checked: false,
		servermsg: null,

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
		}.property( 'password_valid', 'email_valid', 'privacy_checked' )

	})


})
