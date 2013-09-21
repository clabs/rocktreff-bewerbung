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
	return function ( agent, async ) {
		agent
			.post( '/auth/local' )
			.send( { email: email, password: 'foobar' } )
			.end( function ( err ) {
				should.not.exist( err )
				async()
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
			before( function () {
				agent = request.agent( url )
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

	})


})
