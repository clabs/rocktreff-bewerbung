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



describe( 'REST API', function () {

	var url = 'http://localhost:1338';


	describe( 'Authorization', function() {

		describe( 'GET /auth/local', function () {

			it( 'should return per default 401', function ( done ) {
				request( url )
					.post( '/auth/local' )
					.end( function ( err, res ) {
						res.should.have.status( 401 )
						done()
					})
			})

			it( 'should redirect upon successful login', function ( done ) {
				request( url )
					.post( '/auth/local' )
					.send( 'email=admin@rocktreff.de&password=foobar' )
					.end( function ( err, res ) {
						res.should.have.status( 302 )
						done()
					})
			})

		})


	})


})
