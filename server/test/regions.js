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

var id = '7Un4iRxj'


describe( 'Regions', function () {


	describe( 'GET /regions', function () {
		var agent = request.agent( url )


		it( 'should not be accessible without authentication', function ( done ) {
			agent
				.get( '/regions' )
				.expect( 401, done )
		})


		it( 'should return the regions json when authenticated', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/regions' )
					.expect( 'Content-Type', /json/ )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						res.body.should.have.property( 'regions' )
						done()
					})
			})
		})


		it( 'should return a well formatted json', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/regions' )
					.end( function ( err, res ) {
						var json = res.body
						json.should.have.property( 'regions' )
						json.regions[ 0 ].should.have.property( 'name' )
						json.regions[ 0 ].should.have.property( 'id' )
						done()
					})
			})
		})
	})




	describe( 'GET /regions/:id', function () {
		var agent
		beforeEach( function () {
			agent = request.agent( url )
		})


		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.get( '/regions/' + id )
				.expect( 401, done )
		})


		it( 'should be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/regions/' + id )
					.expect( 200, done )
			})
		})


		it( 'should be accessible for friends', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.get( '/regions/' + id )
					.expect( 200, done )
			})
		})


		it( 'should be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.get( '/regions/' + id )
					.expect( 200, done )
			})
		})


		it( 'should be accessible for admin', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/regions/' + id )
					.expect( 200, done )
			})
		})


		it( 'should return the correct json object', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/regions/' + id )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						var json = res.body
						json.should.have.property( 'regions' ).with.lengthOf( 1 )
						var region = json.regions[ 0 ]
						region.id.should.equal( id )
						region.name.should.equal( 'Berlin' )
						done()
					})
			})
		})


		it( 'should return an empty list for an unknown id', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/regions/unknown_id' )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.body.should.have.property( 'regions' ).with.lengthOf( 0 )
						done()
					})
			})
		})
	})




	describe( 'POST /regions', function () {
		var agent
		beforeEach( function () {
			agent = request.agent( url )
		})


		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.post( '/regions' )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.post( '/regions' )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.post( '/regions' )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.post( '/regions' )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/regions' )
					.send( { name: 'new region' } )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						var id = res.body.regions[ 0 ].id
						agent
							.del( '/regions/' + id )
							.expect( 200 )
						done()
					})
			})
		})


		it( 'should reject malformed jsons', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/regions' )
					.send( { region: 'new region' } )
					.expect( 422, done )
			})
		})


		it( 'should return a wellformed json object', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/regions' )
					.send( { name: 'new region' } )
					.expect( 'Content-Type', /json/ )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						var json = res.body
						json.should.have.property( 'regions' ).with.lengthOf( 1 )
						var region = json.regions[ 0 ]
						should.exist( region.id )
						should.exist( region.name )
						region.name.should.equal( 'new region' )
						region.id.should.not.be.empty
						var id = region.id
						agent
							.del( '/regions/' + id )
							.expect( 200 )
						done()
					})
			})
		})
	})




	describe( 'DELETE /regions/:id', function () {
		var agent
		beforeEach( function () {
			agent = request.agent( url )
		})



		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.del( '/regions/' + id )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.del( '/regions/' + id )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.del( '/regions/' + id )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for members of rockini', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.del( '/regions/' + id )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/regions' )
					.send( { name: 'rockini headquater' } )
					.end( function ( err, res ) {
						should.not.exist( err )
						var id = res.body.regions[ 0 ].id
						agent
							.del( '/regions/' + id )
							.expect( 200, done)
					})
			})
		})
	})




	describe( 'PUT /regions/:id', function () {
		var agent
		beforeEach( function () {
			agent = request.agent( url )
		})

		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.put( '/regions/' + id )
				.send( { name: 'Hamburg' } )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.put( '/regions/' + id )
					.send( { name: 'Hamburg' } )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.put( '/regions/' + id )
					.send( { name: 'Hamburg' } )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.put( '/regions/' + id )
					.send( { name: 'Hamburg' } )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.put( '/regions/' + id )
					.send( { name: 'Hamburg' } )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						var json = res.body
						json.should.have.property( 'regions' ).with.lengthOf( 1 )
						var region = json.regions[ 0 ]
						region.id.should.equal( id )
						region.name.should.equal( 'Hamburg' ) // no wai!
						agent
							.put( '/regions/' + id )
							.send( { name: 'Berlin' } )
							.expect( 200, done )
					})
			})
		})

	})


})
