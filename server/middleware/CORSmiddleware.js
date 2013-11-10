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

	app.all( '*', function ( req, res, next ) {
		if ( !req.get( 'Origin' ) ) return next()
		var origin = req.headers.origin || app.get( 'client-url' ) || '*'
		res.set( 'Access-Control-Allow-Credentials', 'true' )
		res.set( 'Access-Control-Expose-Headers', 'ETag, Link, Set-Cookie' )
		res.set( 'Access-Control-Max-Age', '86400' )
		res.set( 'Access-Control-Allow-Headers', 'Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-Requested-With, X-Requested-By, X-Auth-Token' )
		res.set( 'Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE' )
		res.set( 'Access-Control-Allow-Origin', origin )
		if ( 'OPTIONS' == req.method ) return res.send( 200 )
		next()
	})

}
