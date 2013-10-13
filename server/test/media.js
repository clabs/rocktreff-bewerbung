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

var should = require( 'should' )
var assert = require( 'assert' )
var request = require( 'supertest' )
var auth = require( './_config' ).auth
var url = require( './_config' ).url

var id = 'ybWFka7w'
var bid = 'XgLG868X'


describe( 'Media', function () {


	describe( 'GET /media', function () {
		var agent = request.agent( url )


		it( 'should not be accessible without authentication', function ( done ) {
			agent
				.get( '/media' )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/media' )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.get( '/media' )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.get( '/media' )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/media' )
					.expect( 200, done )
			})
		})


		it( 'should return a well formatted json', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/media' )
					.expect( 'Content-Type', /json/ )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						var json = res.body
						json.should.have.property( 'media' )
						json.media.should.not.be.emtpy
						var media = json.media[ 0 ]
						media.should.have.property( 'id' )
						media.should.have.property( 'bid' )
						media.should.have.property( 'type' )
						media.should.have.property( 'mimetype' )
						media.should.have.property( 'filename' )
						media.should.have.property( 'filesize' )
						done()
					})
			})
		})
	})




	describe( 'GET /media/:id', function () {
		var agent
		beforeEach( function () {
			agent = request.agent( url )
		})


		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.get( '/media/' + id )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/media/' + id )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.get( '/media/' + id )
					.expect( 200, done )
			})
		})


		it( 'should be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.get( '/media/' + id )
					.expect( 200, done )
			})
		})


		it( 'should be accessible for admin', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/media/' + id )
					.expect( 200, done )
			})
		})


		it( 'should return the correct json object', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/media/' + id )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						var json = res.body
						json.should.have.property( 'media' ).with.lengthOf( 1 )
						var media = json.media[ 0 ]
						media.should.have.property( 'id' )
						media.should.have.property( 'bid' )
						media.should.have.property( 'type' )
						media.should.have.property( 'mimetype' )
						media.should.have.property( 'filename' )
						media.should.have.property( 'filesize' )
						media.id.should.equal( id )
						media.bid.should.not.be.empty
						media.type.should.not.be.empty
						media.filename.should.not.be.empty
						done()
					})
			})
		})


		it( 'should return an empty list for an unknown id', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.get( '/media/unknown_id' )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.body.should.have.property( 'media' ).with.lengthOf( 0 )
						done()
					})
			})
		})
	})




	describe( 'POST /media', function () {
		var agent
		beforeEach( function () {
			agent = request.agent( url )
		})


		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.post( '/media' )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.post( '/media' )
					.send( { bid: bid, type: 'youtube', url: 'https://www.youtube.com/watch?v=oHg5SJYRHA0' } )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for the band', function ( done ) {
			auth.loginAsBand( agent, function () {
				agent
					.post( '/media' )
					.send( { bid: bid, type: 'youtube', url: 'https://www.youtube.com/watch?v=oHg5SJYRHA0' } )
					.expect( 200, done )
			})
		})


		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.post( '/media' )
					.send( { bid: bid, type: 'youtube', url: 'https://www.youtube.com/watch?v=oHg5SJYRHA0' } )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.post( '/media' )
					.send( { bid: bid, type: 'youtube', url: 'https://www.youtube.com/watch?v=oHg5SJYRHA0' } )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/media' )
					.send( { bid: bid, type: 'youtube', url: 'https://www.youtube.com/watch?v=oHg5SJYRHA0' } )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						var newid = res.body.media[ 0 ].id
						agent
							.del( '/media/' + newid )
							.expect( 200 )
						done()
					})
			})
		})


		it( 'should reject malformed jsons', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/media' )
					.send( { bid: bid } )
					.expect( 422, done )
			})
		})


		it( 'should return a wellformed json object', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/media' )
					.send( { bid: bid, type: 'youtube', url: 'https://www.youtube.com/watch?v=oHg5SJYRHA0' } )
					.expect( 'Content-Type', /json/ )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						var json = res.body
						json.should.have.property( 'media' ).with.lengthOf( 1 )
						var media = json.media[ 0 ]
						media.should.have.property( 'id' )
						media.should.have.property( 'bid' )
						media.should.have.property( 'type' )
						media.should.have.property( 'url' )
						media.id.should.not.be.empty
						media.bid.should.equal( bid )
						var id = media.id
						agent
							.del( '/media/' + id )
							.expect( 200 )
						done()
					})
			})
		})

	})




	describe( 'DELETE /media/:id', function () {
		var agent
		beforeEach( function () {
			agent = request.agent( url )
		})



		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.del( '/media/' + id )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.del( '/media/' + id )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for the band', function ( done ) {
			auth.loginAsBand( agent, function () {
				agent
					.post( '/media' )
					.send( { bid: bid, type: 'youtube', url: 'https://www.youtube.com/watch?v=oHg5SJYRHA0' } )
					.end( function ( err, res ) {
						should.not.exist( err )
						var id = res.body.media[ 0 ].id
						agent
							.del( '/media/' + id )
							.expect( 200, done )
					})
			})
		})


		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.del( '/media/' + id )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for members of rockini', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.del( '/media/' + id )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for admins', function ( done ) {
			auth.loginAsBand( agent, function () {
				agent
					.post( '/media' )
					.send( { bid: bid, type: 'youtube', url: 'https://www.youtube.com/watch?v=oHg5SJYRHA0' } )
					.end( function ( err, res ) {
						should.not.exist( err )
						var id = res.body.media[ 0 ].id
						var agent = request.agent( url )
						auth.loginAsAdmin( agent, function () {
							agent
								.del( '/media/' + id )
								.expect( 200, done)
						})
					})
			})
		})
	})




	describe( 'PUT /media/:id', function () {
		var agent
		beforeEach( function () {
			agent = request.agent( url )
		})

		it( 'should not be defined', function ( done ) {
			agent
				.put( '/media/' + id )
				.expect( 404, done )
		})

	})


})
