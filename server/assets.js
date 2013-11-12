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

	var upload_directory = app.get( 'upload-directory' )
	var url = require( 'url' )
	var path = require( 'path' )
	var fs = require( 'fs' )


	var middleware = function ( req, res, next ) {
		if ( !/^\/uploads\/[^\/]+$/.test( req.url ) )
			return next()
		var parsed_uri = req.url.match( /^\/uploads\/([a-zA-Z0-9]+)(_[a-z0-9]+)?$/ )
		var id = parsed_uri[ 1 ]
		var suffix = parsed_uri[ 2 ] || ''
		if ( !id ) next()
		var filename = path.join( process.cwd(), '/public/uploads', id + suffix )
		var stats
		try {
			stats = fs.lstatSync( filename )
		} catch ( e ) {
			console.log( e )
			res.status( 404 ).send( '404 Not Found\n' )
			return
		}
		if ( stats.isFile() ) {
			app.get( 'models' ).media.get( id )
				.then( function ( media ) {
					res.setHeader( 'Access-Control-Allow-Credentials', 'false' )
					res.setHeader( 'Access-Control-Expose-Headers', '' )
					res.setHeader( 'Access-Control-Max-Age', '86400' )
					res.setHeader( 'Access-Control-Allow-Headers', 'Content-Type' )
					res.setHeader( 'Access-Control-Allow-Methods', 'GET' )
					res.setHeader( 'Access-Control-Allow-Origin', '*' )
					res.setHeader( 'Content-Type', media.mimetype )
					var total = stats.size

					if ( req.headers.range ) {
						var range = req.headers.range
						var parts = range.replace( /bytes=/, '' ).split( '-' )
						var partialstart = parts[0]
						var partialend = parts[1]

						var start = parseInt( partialstart, 10 )
						var end = partialend ? parseInt( partialend, 10 ) : total - 1
						var chunksize = ( end - start ) + 1

						var file = fs.createReadStream( filename, {
							start: start,
							end: end,
							autoClose: false
						})
						file.on( 'open', function ( fd ) {
							res.status( 206 )
							res.setHeader( 'Content-Range', 'bytes ' + start + '-' + end + '/' + total )
							res.setHeader( 'Accept-Ranges', 'bytes' )
							res.setHeader( 'Content-Length', chunksize )
							file.pipe( res )
						})
						file.on( 'close', function () {
							file.destroy()
						})
						file.on( 'error', function ( msg ) {
							console.log( 'error on readstream', msg )
						})

					} else {

						var file = fs.createReadStream( filename, { autoClose:false } )
						file.on( 'open', function () {
							res.status( 200 )
							res.setHeader( 'Content-Length', total )
							file.pipe( res )
						})
						file.on( 'close', function () {
							file.destroy()
						})
						file.on( 'error', function ( msg ) {
							console.log( 'error on readstream', msg )
						})
					}
				},
				function ( err ) {
					console.log( err )
					res.status( 404 ).send( '404 Not Found\n' )
			return
				})
		} else {
			res.status( 500 ).send( '500 Internal server error\n' )
		}
	}
	app.use( middleware )

}


