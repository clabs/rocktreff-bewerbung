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

exports = module.exports = function ( app ) {

	app.use( function ( req, res, next ) {
		var origin = app.get( 'client-url' ) || req.secure + '://' + req.host +( req.port ? ':' + req.port : '' )
		res.header( 'Access-Control-Allow-Origin', app.get( 'client-url' ) )
		res.header( 'Access-Control-Allow-Headers', 'Content-Type,X-Requested-With' )
		res.header( 'Access-Control-Allow-Credentials', 'true' )
		next()
	})

	app.options( '/*', function ( req, res ) {
		res.send( 200 )
	})

}
