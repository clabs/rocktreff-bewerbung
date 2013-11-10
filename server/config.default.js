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

exports = module.exports = function( app ) {

	app.set( 'host', 'localhost' )
	app.set( 'port', 1338 )
	app.set( 'client-url', '*' )
	app.set( 'upload-directory', __dirname + '/public/uploads' )

	// Password encryption
	app.set( 'crypto-key', '42ugiuewgffgfwzegfewif' )

	/*
	app.set( 'facebook-oauth-key', '' ),
	app.set( 'facebook-oauth-secret', '' )
	app.set( 'facebook-callback-url', 'http://localhost:1338/auth/facebook/callback' )

	app.set( 'twitter-oauth-key', '' ),
	app.set( 'twitter-oauth-secret', '' )
	app.set( 'twitter-callback-url', 'http://localhost:1338/auth/twitter/callback' )
	*/
}
