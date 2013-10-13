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

var id = 'pKEMDh8k'


describe( 'Votes', function () {


	describe( 'GET /votes', function () {
		var agent = request.agent( url )


		it( 'should not be accessible without authentication', function ( done ) {
			agent
				.get( '/votes' )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/votes' )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.get( '/votes' )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.get( '/votes' )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/votes' )
					.expect( 200, done )
			})
		})


		it( 'should return a well formatted json', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/votes' )
					.expect( 'Content-Type', /json/ )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						var json = res.body
						json.should.have.property( 'votes' )
						json.votes.should.not.be.emtpy
						var vote = json.votes[ 0 ]
						vote.should.have.property( 'id' )
						vote.should.have.property( 'user' )
						vote.should.have.property( 'bid' )
						vote.should.have.property( 'rating' )
						done()
					})
			})
		})
	})




	describe( 'GET /votes/:id', function () {
		var agent
		beforeEach( function () {
			agent = request.agent( url )
		})


		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.get( '/votes/' + id )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/votes/' + id )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.get( '/votes/' + id )
					.expect( 200, done )
			})
		})


		it( 'should be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.get( '/votes/' + id )
					.expect( 200, done )
			})
		})


		it( 'should be accessible for admin', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/votes/' + id )
					.expect( 200, done )
			})
		})


		it( 'should return the correct json object', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/votes/' + id )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						var json = res.body
						json.should.have.property( 'votes' ).with.lengthOf( 1 )
						var vote = json.votes[ 0 ]
						should.exist( vote.id )
						should.exist( vote.user )
						should.exist( vote.bid )
						should.exist( vote.rating )
						vote.id.should.equal( id )
						vote.user.should.not.be.empty
						vote.bid.should.not.be.empty
						vote.rating.should.be.within( 0, 5 )
						done()
					})
			})
		})


		it( 'should return an empty list for an unknown id', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.get( '/votes/unknown_id' )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.body.should.have.property( 'votes' ).with.lengthOf( 0 )
						done()
					})
			})
		})
	})




	describe( 'POST /votes', function () {
		var agent, bid = 'XgLG868X'
		beforeEach( function () {
			agent = request.agent( url )
		})


		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.post( '/votes' )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.post( '/votes' )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.post( '/votes' )
					.send( { user: 'U6Jp1nEf', bid: bid, rating: 1 } )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						var newid = res.body.votes[ 0 ].id
						agent
							.del( '/votes/' + newid )
							.expect( 200 )
						done()
					})
			})
		})


		it( 'should be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.post( '/votes' )
					.send( { user: 'GNbUQQgL', bid: bid, rating: 1 } )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						var newid = res.body.votes[ 0 ].id
						agent
							.del( '/votes/' + newid )
							.expect( 200 )
						done()
					})
			})
		})


		it( 'should be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/votes' )
					.send( { user: 'dnjnCB3T', bid: bid, rating: 1 } )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						var newid = res.body.votes[ 0 ].id
						agent
							.del( '/votes/' + newid )
							.expect( 200 )
						done()
					})
			})
		})


		it( 'should reject malformed jsons', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/votes' )
					.send( { bid: bid, rating: 1337 } )
					.expect( 422, done )
			})
		})

		it( 'should reject votes for other users', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/votes' )
					.send( { user: 'someone', bid: bid, rating: 1 } )
					.expect( 403, done )
			})
		})


		it( 'should return a wellformed json object', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/votes' )
					.send( { user: 'dnjnCB3T', bid: bid, rating: 1 } )
					.expect( 'Content-Type', /json/ )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						var json = res.body
						json.should.have.property( 'votes' ).with.lengthOf( 1 )
						var vote = json.votes[ 0 ]
						should.exist( vote.id )
						should.exist( vote.user )
						should.exist( vote.bid )
						should.exist( vote.rating )
						vote.id.should.not.be.empty
						vote.user.should.equal( 'dnjnCB3T' )
						vote.bid.should.equal( bid )
						vote.rating.should.equal( 1 )
						var id = vote.id
						agent
							.del( '/votes/' + id )
							.expect( 200 )
						done()
					})
			})
		})
	})




	describe( 'DELETE /votes/:id', function () {
		var agent, bid = 'XgLG868X'
		beforeEach( function () {
			agent = request.agent( url )
		})



		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.del( '/votes/' + id )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.del( '/votes/' + id )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.del( '/votes/' + id )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for members of rockini', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.del( '/votes/' + id )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/votes' )
					.send( { user: 'dnjnCB3T', bid: bid, rating: 1 } )
					.end( function ( err, res ) {
						should.not.exist( err )
						var id = res.body.votes[ 0 ].id
						agent
							.del( '/votes/' + id )
							.expect( 200, done)
					})
			})
		})
	})




	describe( 'PUT /votes/:id', function () {
		var agent, uid = 'GNbUQQgL', bid = 'XgLG868X'
		beforeEach( function () {
			agent = request.agent( url )
		})

		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.put( '/votes/' + id )
				.send( { id: id, user: uid, bid: bid, rating: 5 } )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.put( '/votes/' + id )
					.send( { id: id, user: uid, bid: bid, rating: 5 } )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.put( '/votes/' + id )
					.send( { id: id, user: uid, bid: bid, rating: 5 } )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for the owner', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.put( '/votes/' + id )
					.send( { id: id, user: uid, bid: bid, rating: 5 } )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						var vote = res.body.votes[ 0 ]
						vote.rating.should.equal( 5 )
						done()
					})
			})
		})


		it( 'should be impossible to alter the owner', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.put( '/votes/' + id )
					.send( { id: id, user: 'U6Jp1nEf', bid: bid, rating: 5 } )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.put( '/votes/' + id )
					.send( { id: id, user: uid, bid: bid, rating: 5 } )
					.expect( 403, done )
			})
		})

	})


})
