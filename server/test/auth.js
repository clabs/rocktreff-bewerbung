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

		it( 'should return a token upon successful authentication', function ( done ) {
			request( url )
				.post( '/auth/local' )
				.send({
					email: 'admin@rocktreff.de',
					password: 'foobar'
				})
				.expect( 200 )
				.end( function ( err, res ) {
					should.not.exist( err )
					res.body.should.have.property( 'token' )
					res.body.token.should.have.property( 'user' )
					res.body.token.should.have.property( 'id' )
					res.body.token.should.have.property( 'timestamp' )
					done()
				})
		})

	})

})
