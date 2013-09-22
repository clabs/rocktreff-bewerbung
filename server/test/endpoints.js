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
var url = 'http://localhost:1338'

/**
 * HELPERS
 */

var login = function ( email ) {
	return function ( agent, done ) {
		agent
			.post( '/auth/local' )
			.send( { email: email, password: 'foobar' } )
			.end( function ( err, res ) {
				should.not.exist( err )
				agent.saveCookies( res )
				done()
			})
	}
}

var loginAsAdmin = login( 'admin@rocktreff.de' )
var loginAsIni = login( 'ini@rocktreff.de' )
var loginAsFriend = login( 'friend@rocktreff.de' )
var loginAsSomeone = login( 'some@one.com' )


describe( 'REST API', function () {

	describe( 'Authentication', function() {

		describe( 'POST /auth/local', function () {

			it( 'should reject requests without credentials', function ( done ) {
				request( url )
					.post( '/auth/local' )
					.expect( 401, done )
			})

			it( 'should reject requests with bad credentials', function ( done ) {
				request( url )
					.post( '/auth/local' )
					.send({
						email: 'admin@rocktreff.de',
						password: 'foobaz'
					})
					.expect( 401, done )
			})

			it( 'should redirect to /me upon successful authentication', function ( done ) {
				request( url )
					.post( '/auth/local' )
					.send({
						email: 'admin@rocktreff.de',
						password: 'foobar'
					})
					.expect( 302 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.headers.should.have.property( 'location', '/me' )
						done()
					})
			})

		})

	})

	describe( 'Users', function () {

		describe( 'GET /me', function () {
			var agent = request.agent( url )

			it( 'should not be accessible without authentication', function ( done ) {
				agent
					.get( '/me' )
					.expect( 401, done )
			})

			it( 'should return the user json when authenticated', function ( done ) {
				loginAsSomeone( agent, function () {
					agent
						.get( '/me' )
						.expect( 'Content-Type', /json/ )
						.expect( 200, done )
				})
			})

			it( 'should return a well formatted json', function ( done ) {
				loginAsAdmin( agent, function () {
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
				loginAsSomeone( agent, function () {
					agent
						.get( '/users' )
						.expect( 401, done )
				})
			})

			it( 'should not be accessible for members of rockini', function ( done ) {
				loginAsIni( agent, function () {
					agent
						.get( '/users' )
						.expect( 401, done )
				})
			})

			it( 'should not be accessible for friends', function ( done ) {
				loginAsFriend( agent, function () {
					agent
						.get( '/users' )
						.expect( 401, done )
				})
			})

			it( 'should be accessible for admins', function ( done ) {
				loginAsAdmin( agent, function () {
					agent
						.get( '/users' )
						.expect( 200, done )
				})
			})

			it( 'should return a well formatted json', function ( done ) {
				loginAsAdmin( agent, function () {
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
						picture_url: '',
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
						loginAsAdmin( agent, function () {
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
						picture_url: '',
						provider: 'local',
						role: ''
					})
					.expect( 409, done )
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
				loginAsAdmin( agent, function () {
					agent
						.del( '/user/' + id )
						.expect( 200, done || function () {} )
				})
			}


			beforeEach( function () {
				agent = request.agent( url )
			})


			it( 'should return a bad request for unknown ids', function ( done ) {
				loginAsAdmin( agent, function () {
					agent
						.del( '/user/some_random_id' )
						.expect( 400, done )
				})
			})


			it( 'should be accessible for admins', function ( done ) {
				create_user( agent, function ( id, email ) {
					loginAsAdmin( agent, function () {
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
					loginAsSomeone( agent, function () {
						agent
							.del( '/user/' + id )
							.expect( 401 )
							.end( function ( err, res ) {
								should.not.exist( err )
								remove_user( agent, id, done )
							})
					})
				})
			})

		})

	})


})
