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
	var LocalStrategy = require( 'passport-local' ).Strategy
	var FacebookStrategy = require( 'passport-facebook' ).Strategy
	var User = app.get( 'models' ).user
	var crypto = require( 'crypto' )

	// Local
	passport.use( new LocalStrategy({
			usernameField: 'email'
		},
		function ( email, password, done ) {
			User.find( { email: email }, function ( err, user ) {
				var sha256 = crypto.createHash( 'sha256' )
				var hash = sha256.update( password ) && sha256.digest( 'hex' )
				if ( user && user.password === hash )
					return done( null, user )
				else
					return done( err, false, { message: 'Incorrect email or password' } )
			})
		}
	))


	// Facebook
	if ( app.get( 'facebook-oauth-key' ) )
	passport.use( new FacebookStrategy({
			clientID: app.get( 'facebook-oauth-key' ),
			clientSecret: app.get( 'facebook-oauth-secret' )
		},
		function ( accessToken, refreshToken, profile, done ) {
			// Hand off to caller
			done( null, false, {
				accessToken: accessToken,
				refreshToken: refreshToken,
				profile: profile
			})
	}))

	// Serialize
	passport.serializeUser( function ( user, done ) {
		done( null, user.id )
	})

	// Deserialize
	passport.deserializeUser( function( id, done ) {
		User.get( id, function ( err, user ) {
			done( err, user )
		})
	})

}
