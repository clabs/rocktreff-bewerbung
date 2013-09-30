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


describe( 'Users', function () {

	describe( 'GET /me', function () {
		var agent = request.agent( url )

		it( 'should not be accessible without authentication', function ( done ) {
			agent
				.get( '/me' )
				.expect( 401, done )
		})

		it( 'should return the user json when authenticated', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/me' )
					.expect( 'Content-Type', /json/ )
					.expect( 200, done )
			})
		})

		it( 'should return a well formatted json', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/me' )
					.end( function ( err, res ) {
						var json = res.body
						json.should.have.property( 'users' ).with.lengthOf( 1 )
						json.users[ 0 ].should.not.have.property( 'password' )
						done()
					})
			})
		})

	})


	describe( 'GET /users', function () {
		var agent = null
		beforeEach( function ( done ) {
			agent = request.agent( url )
			done()
		})

		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.get( '/users' )
				.expect( 401, done )
		})

		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/users' )
					.expect( 403, done )
			})
		})

		it( 'should not be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.get( '/users' )
					.expect( 403, done )
			})
		})

		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.get( '/users' )
					.expect( 403, done )
			})
		})

		it( 'should be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/users' )
					.expect( 200, done )
			})
		})

		it( 'should return a well formatted json', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/users' )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						var json = res.body
						json.should.have.property( 'users' )
						json.users.should.be.an.instanceOf( Array )
						json.users.length.should.be.above( 1 )
						json.users[ 0 ].should.not.have.property( 'password' )
						done()
					})
			})
		})

	})

	describe( 'POST /users', function () {

		var agent
		beforeEach( function() {
			agent = request.agent( url )
		})

		it( 'should return a JSON object with an id property', function ( done ) {
			agent
				.post( '/users' )
				.send({
					name: 'foo',
					email: 'foo@bar.com',
					password: 'foobar',
					provider: 'local',
					role: ''
				})
				.expect( 200 )
				.end( function ( err, res ) {
					should.not.exist( err )
					res.should.be.json
					var json = res.body
					json.should.have.property( 'users' )
					json.should.have.property( 'users' ).with.lengthOf( 1 )
					var user = json.users[ 0 ]
					should.exist( user.id )
					// cleanup user
					var agent = request.agent( url )
					auth.loginAsAdmin( agent, function () {
						agent
							.del( '/user/' + user.id )
							.expect( 200, done )
					})
				})
		})

		it( 'should reject duplicate emails', function ( done ) {
			agent
				.post( '/users' )
				.send({
					name: 'foo',
					email: 'admin@rocktreff.de',
					password: '12345',
					provider: 'local',
					role: ''
				})
				.expect( 409, done )
		})

		it( 'should reject users with password not set', function ( done ) {
			agent
				.post( '/users' )
				.send({
					name: 'foo',
					email: 'admin@rocktreff.de',
					provider: 'local',
					role: ''
				})
				.expect( 400, done )
		})

		it( 'should reject new users with a role', function ( done ) {
			agent
				.post( '/users' )
				.send({
					name: 'foo',
					email: 'foo@baz.com',
					password: '12345',
					picture_url: '',
					provider: 'local',
					role: 'admin'
				})
				.expect( 400, done )
		})

	})

	describe( 'DELETE /user/:id', function () {
		var id = 1, agent
		var create_user = function ( agent, done ) {
			agent
				.post( '/users' )
				.send({
					name: 'foo',
					email:  ( id += 1 )+ 'foo@foo.bar',
					password: 'foobar',
					picture_url: '',
					provider: 'local',
					role: ''
				})
				.expect( 200 )
				.end( function ( err, res ) {
					should.not.exist( err )
					res.should.be.json
					var json = res.body
					json.should.have.property( 'users' ).with.lengthOf( 1 )
					var user = json.users[ 0 ]
					done( user.id, user.email )
				})
		}
		var remove_user = function ( agent, id, done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.del( '/user/' + id )
					.expect( 200, done || function () {} )
			})
		}


		beforeEach( function () {
			agent = request.agent( url )
		})


		it( 'should return a bad request for unknown ids', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.del( '/user/some_random_id' )
					.expect( 400, done )
			})
		})


		it( 'should be accessible for admins', function ( done ) {
			create_user( agent, function ( id, email ) {
				auth.loginAsAdmin( agent, function () {
					agent
						.del( '/user/' + id )
						.expect( 200, done )
				})
			})
		})


		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.del( '/user/some_random_id' )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone else', function ( done ) {
			create_user( agent, function ( id, email ) {
				auth.loginAsSomeone( agent, function () {
					agent
						.del( '/user/' + id )
						.expect( 403 )
						.end( function ( err, res ) {
							should.not.exist( err )
							remove_user( agent, id, done )
						})
				})
			})
		})

	})

	describe( 'GET /user/:id', function () {
		var agent, id = '90fFt41t' // id of someone
		beforeEach( function (){
			agent = request.agent( url )
		})


		it( 'should be not accessible for anyone', function ( done ) {
			agent
				.get( '/user/' + id )
				.expect( 401, done )
		})

		it( 'should be accessible for authenticated users', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/user/' + id )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						res.body.should.have.property( 'users' ).with.lengthOf( 1 )
						var user = res.body.users[ 0 ]
						user.id.should.eql( id )
						done()
					})
			})
		})

	})

	describe( 'PUT /user/:id', function () {
		var agent
		var someone = {
			id: '90fFt41t',
			name: 'someone',
			email: 'some@one.com',
			created: '2013-09-20T19:48:40.501Z',
			provider: 'local',
			role: ''
		}
		beforeEach( function (){
			agent = request.agent( url )
		})


		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.put( '/user/' + someone.id )
				.send({
					name: 'foobar'
				})
				.expect( 401, done )
		})

		it( 'should not be accessible for other authenticated users', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.put( '/user/' + someone.id )
					.expect( 403, done )
			})
		})

		it( 'should be accessible for the user', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.put( '/user/' + someone.id )
					.send( someone )
					.expect( 200, done )
			})
		})

		it( 'should be accessible for an admin', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.put( '/user/' + someone.id )
					.send( someone )
					.expect( 200, done )
			})
		})

		// TODO: add specs for updated settings
	})

})
