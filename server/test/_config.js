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

exports = module.exports = {
	auth: {
		login: login,
		loginAsAdmin: login( 'admin@rocktreff.de' ),
		loginAsIni: login( 'ini@rocktreff.de' ),
		loginAsFriend: login( 'friend@rocktreff.de' ),
		loginAsSomeone: login( 'some@one.com' )
	},
	url: 'http://localhost:1338'
}
