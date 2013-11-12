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

	var fs = require( 'fs' )
	var os = require( 'os' )
	var exec = require( 'child_process' ).exec
	var ffmpeg = require( 'fluent-ffmpeg' )
	var Promise = require( 'promise' )
	var models = app.get( 'models' )
	var schema = require( '../models/schemas' )
	var json = require( '../utils/json' )( schema.media )
	var send = json.send( 'media' )
	var empty = function ( res ) {
		return function () {
			send( res )( [] )
		}
	}
	var saveFile = function ( dataurl ) {
		return function ( media ) {
			var path = app.get( 'upload-directory' ) + '/' + media.id
			if ( !dataurl ) return media
			return new Promise( function ( fulfill, reject) {
				var data = dataurl.replace( /^data:.*?;base64,/, '' )
				fs.writeFile( path, data, 'base64', function ( err ) {
					if ( err ) reject( err )
					else fulfill( media )
				})
			})
		}
	}
	var deleteFile = function ( media ) {
		var path = app.get( 'upload-directory' ) + '/' + media.id
		return new Promise( function ( fulfill, reject) {
			fs.unlink( path, function ( err ) {
				if ( err ) reject( err )
				else fulfill( media )
			})
		})
	}
	var moveFile = function ( src, dest ) {
		return function ( media ) {
			return new Promise( function ( fulfill, reject ) {
				var is = fs.createReadStream( src )
				var os = fs.createWriteStream( dest )
				is.pipe( os )
				is.on( 'end', function () {
					fs.unlinkSync( src )
					fulfill( media )
				})
			})
		}
	}
	var injectMediaURL = function () {
		function addURL ( media ) {
			if ( media.type !== 'youtube' )
				media.url = 'http://'+app.get( 'host' )+':'+app.get( 'port' )+'/uploads/'+media.id
			return media
		}
		return function ( media ) {
			if ( media instanceof Array )
				return media.map( function ( media ) {
					return addURL( media )
				})
			return addURL( media )
		}
	}
	var processMedia = function ( media ) {
		if ( media.type === 'audio' )
			return transcodeMP3( media )
		else if ( media.type === 'picture' )
			return getImageMeta( media )
					.then( resizeImage )
		else if ( media.type === 'logo' )
			return getImageMeta( media )
					.then( resizeImage )
		else
			return media
	}
	var transcodeMP3 = function ( media ) {
		var path = app.get( 'upload-directory' ) + '/' + media.id
		var tmp = os.tmpdir() + media.id
		return new Promise( function ( fulfill, reject ) {
			var proc = new ffmpeg({
				source: path,
				timeout: 30,
				priority: 0,
			})
			.withAudioBitrate( '128k' )
			.withAudioCodec( 'libmp3lame' )
			.toFormat( 'mp3' )
			.saveToFile( tmp, function ( _, stdout, err ) {
				if ( err ) reject( err )
				else fulfill( media )
			})
		})
		.then( moveFile( tmp, path ) )
		.then( function ( media ) {
			media.filesize = fs.lstatSync( path ).size
			media.mimetype = 'audio/mpeg'
			return media
		})
	}

	var getImageMeta = function ( media ) {
		var src = app.get( 'upload-directory' ) + '/' + media.id
		var cmd = 'convert '+src+' -identify '+src//+' | cut -d " " -f3'
		return new Promise( function ( fulfill, reject ) {
			exec( cmd, function ( err, stdout, stderr ) {
				if ( err ) reject( err )
				else {
					media.meta = stdout.replace( /^.*? |\\n/, '' )
					fulfill( media )
				}
			})
		})
	}

	var resizeImage = function ( media ) {
		var src = app.get( 'upload-directory' ) + '/' + media.id
		var dst = src + '_small'
		var cmd = 'convert '+src+' -resize "200^>" ' + dst
		return new Promise( function ( fulfill, reject ) {
			exec( cmd, function ( err, stdout, stderr ) {
				if ( err ) reject( [ err, stderr ] )
				else fulfill( media )
			})
		})
	}


	return {

		get: function ( req, res ) {
			var id = req.params.id
			models.media.get( id )
				.then( function ( media ) {
					return models.bid.get( media.bid )
				}, empty( res ) )
				.then( function ( bid ) {
					if ( bid.user !== req.user.id && req.user.role === '' )
						throw res.status( 403 ).send()
					return bid
				})
				.then( function () {
					return models.media.get( id )
				})
				.then( injectMediaURL )
				.then( send( res ) )
		},

		post: function ( req, res ) {
			var data = req.body.data
			delete req.body.data

			models.bid.get( req.body.bid )
				.then( function ( bid ) {
					if ( !bid )
						throw res.status( 406 ).send()
					if ( bid.user !== req.user.id && req.user.role !== 'admin')
						throw res.status( 403 ).send()
					return json.create( req.body )
				})
				.then( function ( media ) {
					return models.media.create( media )
				})
				.then( saveFile( data ) )
				.then( processMedia )
				.then( function ( media ) {
					return models.media.set( media.id, media )
				})
				.then( injectMediaURL )
				.then( send( res ) )
		},


		put: function ( req, res ) {
			var id = req.params.id
			var data = req.body.data
			delete req.body.data

			if ( !models.bid.has( req.body.bid ) )
				return res.status( 404 ).send()
			if ( !models.media.has( id ) )
				return res.status( 400 ).send()

			models.media.save( req.body )
				.then( saveFile( data ) )
				.then( processMedia )
				.then( function ( media ) {
					return models.media.save( media )
				})
				.then( injectMediaURL )
				.then( send( res ) )
		},


		del: function ( req, res ) {
			var id = req.params.id
			models.media.get( id )
				.then( function ( media ) {
					if ( !media ) throw res.status( 400 ).send()
					return models.bid.get( media.bid )
				})
				.then( function ( bid ) {
					if ( !bid )
						throw res.status( 400 ).send()
					if ( bid.user !== req.user.id && req.user.role !== 'admin' )
						throw res.status( 403 ).send()
					return models.media.get( id )
				})
				.then( deleteFile, function ( err ) {
					res.send( 500, err )
				})
				.then( function () {
					return models.media.del( id )
				}, function ( err ) {
					// delete at least the record
					return models.media.del( id )
				})
				.then( send( res ) )
		},


		list: function ( req, res ) {
			var query = req.user.role === '' ?
				{ user: req.user.id } : req.query
			models.media.find( query )
				.then( injectMediaURL )
				.then( send( res ), function ( err ) {
					res.status( 500 ).send()
				})
		}

	}


}
