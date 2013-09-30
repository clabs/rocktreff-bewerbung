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

var id = '9egP7Q0E'


describe( 'Events', function () {


	describe( 'GET /events', function () {
		var agent = request.agent( url )


		it( 'should not be accessible without authentication', function ( done ) {
			agent
				.get( '/events' )
				.expect( 401, done )
		})


		it( 'should return the events json when authenticated', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/events' )
					.expect( 'Content-Type', /json/ )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						res.body.should.have.property( 'events' )
						done()
					})
			})
		})


		it( 'should return a well formatted json', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/events' )
					.end( function ( err, res ) {
						var json = res.body
						json.should.have.property( 'events' )
						var event = json.events[ 0 ]
						event.should.have.property( 'name' )
						event.should.have.property( 'id' )
						event.should.have.property( 'opening_date' )
						event.should.have.property( 'closing_date' )
						done()
					})
			})
		})
	})




	describe( 'GET /event/:id', function () {
		var agent
		beforeEach( function () {
			agent = request.agent( url )
		})


		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.get( '/event/' + id )
				.expect( 401, done )
		})


		it( 'should be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/event/' + id )
					.expect( 200, done )
			})
		})


		it( 'should be accessible for friends', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.get( '/event/' + id )
					.expect( 200, done )
			})
		})


		it( 'should be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.get( '/event/' + id )
					.expect( 200, done )
			})
		})


		it( 'should be accessible for admin', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/event/' + id )
					.expect( 200, done )
			})
		})


		it( 'should return the correct json object', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/event/' + id )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						var json = res.body
						json.should.have.property( 'events' ).with.lengthOf( 1 )
						var event = json.events[ 0 ]
						event.id.should.equal( id )
						event.name.should.equal( 'ROCKTREFF Festival' )
						done()
					})
			})
		})


		it( 'should return an empty list for an unknown id', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/event/unknown_id' )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.body.should.have.property( 'events' ).with.lengthOf( 0 )
						done()
					})
			})
		})
	})




	describe( 'POST /events', function () {
		var agent
		beforeEach( function () {
			agent = request.agent( url )
		})


		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.post( '/events' )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.post( '/events' )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.post( '/events' )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.post( '/events' )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/events' )
					.send({
						name: 'new event 1',
						opening_date: "Nov 11 2013 11:11:11 GMT+0200 (CEST)",
						closing_date: "Nov 12 2013 11:11:11 GMT+0200 (CEST)"
					})
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						var newid = res.body.events[ 0 ].id
						agent
							.del( '/event/' + newid )
							.expect( 200, done )
					})
			})
		})


		it( 'should reject malformed jsons', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/events' )
					.send( { event: 'new event' } )
					.expect( 422, done )
			})
		})


		it( 'should return a wellformed json object', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/events' )
					.send({
						name: 'new event 2',
						opening_date: "Nov 11 2013 11:11:11 GMT+0200 (CEST)",
						closing_date: "Nov 12 2013 11:11:11 GMT+0200 (CEST)"
					})
					.expect( 'Content-Type', /json/ )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						var json = res.body
						json.should.have.property( 'events' ).with.lengthOf( 1 )
						var event = json.events[ 0 ]
						should.exist( event.id )
						should.exist( event.name )
						should.exist( event.opening_date )
						should.exist( event.closing_date )
						event.name.should.equal( 'new event 2' )
						event.id.should.not.be.empty
						var newid = event.id
						agent
							.del( '/event/' + newid )
							.expect( 200, done )
					})
			})
		})
	})




	describe( 'DELETE /region/:id', function () {
		var agent
		beforeEach( function () {
			agent = request.agent( url )
		})



		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.del( '/event/' + id )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.del( '/event/' + id )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.del( '/event/' + id )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for members of rockini', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.del( '/event/' + id )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/events' )
					.send({
						name: 'Rockini Party',
						opening_date: "Nov 11 2013 11:11:11 GMT+0200 (CEST)",
						closing_date: "Nov 12 2013 11:11:11 GMT+0200 (CEST)"
					})
					.end( function ( err, res ) {
						should.not.exist( err )
						var id = res.body.events[ 0 ].id
						agent
							.del( '/event/' + id )
							.expect( 200, done)
					})
			})
		})
	})




	describe( 'PUT /event/:id', function () {
		var agent
		beforeEach( function () {
			agent = request.agent( url )
		})

		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.put( '/event/' + id )
				.send( { name: 'Schlagerfestival' } )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.put( '/event/' + id )
					.send( { name: 'Schlagerfestival' } )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.put( '/event/' + id )
					.send( { name: 'Schlagerfestival' } )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.put( '/event/' + id )
					.send( { name: 'Schlagerfestival' } )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.put( '/event/' + id )
					.send({
						name: 'Schlagerfestival',
						opening_date: "Nov 11 2013 11:11:11 GMT+0200 (CEST)",
						closing_date: "Nov 12 2013 11:11:11 GMT+0200 (CEST)"
					})
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						var json = res.body
						json.should.have.property( 'events' ).with.lengthOf( 1 )
						var event = json.events[ 0 ]
						event.id.should.equal( id )
						event.name.should.equal( 'Schlagerfestival' ) // no wai!
						agent
							.put( '/event/' + id )
							.send({
								name: 'ROCKTREFF Festival',
								opening_date: "Nov 11 2013 11:11:11 GMT+0200 (CEST)",
								closing_date: "Nov 12 2013 11:11:11 GMT+0200 (CEST)"
							})
							.expect( 200, done )
					})
			})
		})

	})


})
