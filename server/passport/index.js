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

exports = module.exports = function( app, passport ) {
	var Promise = require( 'promise' )
	var LocalStrategy = require( 'passport-local' ).Strategy
	var BearerStrategy = require( 'passport-http-bearer' ).Strategy
	var FacebookStrategy = require( 'passport-facebook' ).Strategy
	var TwitterStrategy = require( 'passport-twitter' ).Strategy
	var guid = require( '../utils/guid' )
	var User = app.get( 'models' ).user
	var AccessToken = require( '../models/token' )
	var crypto = require( 'crypto' )


	// Local
	passport.use( new LocalStrategy({
			usernameField: 'email'
		},
		function ( email, password, done ) {
			User.find( { email: email } )
				.then( function ( user ) {
					console.log( 'LocalStrategy', email, password )
					user = user[ 0 ]
					var sha256 = crypto.createHash( 'sha256' )
					var hash = sha256.update( password ) && sha256.digest( 'hex' )
					if ( user && user.password === hash )
						AccessToken.create( user ).then( function () {
							done( null, user )
						})
					else
						done( null, null, { message: 'Incorrect email or password' } )
				}, function ( err ) {
					done( err, null, { message: 'Incorrect email or password' } )
				})
		}
	))


	// Bearer
	passport.use( new BearerStrategy(
		function ( token, done ) {
			process.nextTick( function () {
				AccessToken.verify( token )
					.then( function ( token ) {
						return User.get( token.user )
					}, function () {
						done( null, null, { message: 'Accesstoken unknown' } )
					})
					.then( function ( user ) {
						if ( user ) done( null, user )
					})
			})
		}
	))

	// Facebook
	if ( app.get( 'facebook-oauth-key' ) )
	passport.use( new FacebookStrategy({
			clientID: app.get( 'facebook-oauth-key' ),
			clientSecret: app.get( 'facebook-oauth-secret' ),
			callbackURL: app.get( 'facebook-callback-url' ),
			display: 'popup'
		},
		function ( accessToken, refreshToken, profile, done ) {
			var name = profile.displayName
			var email = profile.emails[0].value
			var request = require( 'request' )
			var imgurl = 'https://graph.facebook.com/'+ profile.username +'/picture?redirect=false&type=square&access_token='+accessToken
			var updateFacebookPicture = function ( user ) {
				return new Promise( function ( fullfill, reject ) {
					request
						.get( imgurl , function ( err, res, body ) {
							if ( err ) reject( err )
							else fullfill( JSON.parse( body ) )
						})
				}).then( function ( json ) {
					user.picture = json.data.url
					return User.save( user )
				})
			}
			User.find( { email: email } )
				.then( function ( user ) {
					user = user[ 0 ]
					return user ? user : User.create({
						name: name,
						email: email,
						provider: 'facebook',
						role: ''
					})
					.then( function ( user ) {
						app.get( 'mailer' ).greetings( user )
						return user
					})
				})
				.then( updateFacebookPicture )
				.then( function ( user ) {
					return AccessToken.create( user ).then( function () {
						return user
					})
				})
				.then( function ( user ) {
					done( null, user )
				})
	}))





	// Twitter
	if ( app.get( 'twitter-oauth-key' ) )
	passport.use( new TwitterStrategy({
			consumerKey: app.get( 'twitter-oauth-key' ),
			consumerSecret: app.get( 'twitter-oauth-secret' ),
			callbackURL: app.get( 'twitter-callback-url' )
		},
		function ( token, tokenSecret, profile, done ) {
			var name = profile.displayName
			var email = profile.emails[0].value
			User.find( { email: email } )
				.then( function ( user ) {
					user = user[ 0 ]
					return user ? user : User.create({
						name: name,
						email: email,
						provider: 'twitter',
						role: ''
					})
				})
				.then( function ( user ) {
					return AccessToken.create( user ).then( function () {
						return user
					})
				})
				.then( function ( user ) {
					console.log( profile )
					done( null, user )
				})
	}))




	// Serialize
	passport.serializeUser( function ( user, done ) {
		done( null, user.id )
	})

	// Deserialize
	passport.deserializeUser( function( id, done ) {
		User.get( id ).then(
			function ( user ) { done( null, user ) },
			function ( err)   { done( err, false ) }
		)
	})

}
