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
	var crypto = require( 'crypto' )
	var fdman = require( 'fd' )()
	var AC = require( 'async-cache' )

	var statCache = AC({
		max: 100,
		maxAge: 10000,
		load: function ( path, callback ) {
			fs.stat( path, callback )
		}
	})

	var fdCache = AC({
		max: 100,
		maxAge: 10000,
		// use fdman to open & close
		load: fdman.open.bind( fdman ),
		dispose: fdman.close.bind( fdman )
	})

	var setCachingHeaders = function ( res, stat ) {
		var sha1 = crypto.createHash( 'sha1' )
		var etag = sha1.update( stat.mtime.getTime() +' '+ stat.ino ).digest( 'hex' )
		res.setHeader( 'ETag', '"'+etag+'"' )
		res.setHeader( 'Vary', 'Accept-Encoding' )
		res.setHeader( 'Cache-Control', 'public, max-age=86400' ) // cache 24h
		res.setHeader( 'Last-Modified', ( new Date( stat.mtime.getTime() )).toUTCString() )
		res.setHeader( 'Expires', (new Date(Date.now()+86400000)).toUTCString() )
	}

	var serveError = function ( res ) {
		res.status( 404 ).send( '404 Not Found\n' )
	}

	var serveRanged = function ( req, res, stat, fileStream ) {
		var range = req.headers.range
		var parts = range.replace( /bytes=/, '' ).split( '-' )
		var partialstart = parts[0]
		var partialend = parts[1]

		var start = parseInt( partialstart, 10 )
		var end = partialend ? parseInt( partialend, 10 ) : stat.size - 1
		var chunksize = ( end - start ) + 1

		res.status( 206 )
		res.setHeader( 'Content-Range', 'bytes ' + start + '-' + end + '/' + stat.size )
		res.setHeader( 'Accept-Ranges', 'bytes' )
		res.setHeader( 'Content-Length', chunksize )
		fileStream.pipe( res )
	}

	var serveFile = function ( res, stat, fileStream ) {
		res.status( 200 )
		res.setHeader( 'Content-Length', stat.size )
		fileStream.pipe( res )
	}

	var middleware = function ( req, res, next ) {
		// only care about upload requests
		if ( !/^\/uploads\/[^\/]+$/.test( req.url ) )
			return next()
		// extract filename
		var parsed_uri = req.url.match( /^\/uploads\/([a-zA-Z0-9]+)(_[a-z0-9]+)?$/ )
		var id = parsed_uri[ 1 ]
		var suffix = parsed_uri[ 2 ] || ''
		var filename = path.join( process.cwd(), '/public/uploads', id + suffix )
		// return 404 unless id is given
		if ( !id ) return serveError( res )
		// get the media model for the given id
		app.get( 'models' ).media.get( id ).then( function ( media ) {
			// get a fs.stat for this file
			statCache.get( filename , function ( err, stat ) {
				if ( err || !stat.isFile() )
					return serveError( res )
				// get an fd for this file
				fdCache.get( filename , function ( err, fd ) {
					// get a safe checkin function from fdman that
					// we could safely all multiple times for this single
					// checkout
					var checkin = fdman.checkinfn( filename , fd )
					// check out the fd for use
					fdman.checkout( filename , fd )
					// stream from the fd to the response
					var fileStream = fs.createReadStream( filename , {
						fd: fd,
						start: 0,
						end: stat.size
					})
					.on( 'end', checkin )
					.on( 'error', checkin )
					// override destroy so we don't close the fd
					fileStream.destroy = function () {}
					res.setHeader( 'Access-Control-Allow-Origin', '*' )
					// don't force download, just show it
					res.setHeader( 'Content-Type', media.mimetype !== 'application/octet-stream' ? media.mimetype : 'text/plain' )
					// add caching headers
					setCachingHeaders( res, stat )
					// ranged request
					if ( req.headers.range )
						serveRanged( req, res, stat, fileStream )
					else
						serveFile( res, stat, fileStream )
				})
			})
		},
		// if media does not exist server an 404 error
		serveError )
	}
	app.use( middleware )

}


