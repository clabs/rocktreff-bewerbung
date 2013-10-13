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

var id = 'XgLG868X'


describe( 'Bids', function () {


	describe( 'GET /bids', function () {
		var agent = request.agent( url )


		it( 'should not be accessible without authentication', function ( done ) {
			agent
				.get( '/bids' )
				.expect( 401, done )
		})


		it( 'should be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/bids' )
					.expect( 200, done )
			})
		})


		it( 'should be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.get( '/bids' )
					.expect( 200, done )
			})
		})


		it( 'should be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.get( '/bids' )
					.expect( 200, done )
			})
		})


		it( 'should be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/bids' )
					.expect( 200, done )
			})
		})


		it( 'should be possible to filter results', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.get( '/bids/?region=3kuSFRwx' )
					.expect( 200 )
					.end( function ( err, res ) {
						res.body.should.have.property( 'bids' ).with.lengthOf( 1 )
						res.body.bids[ 0 ].bandname.should.equal( 'Someones Band' )
						done()
					})
			})
		})


		it( 'should return a well formatted json', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/bids' )
					.expect( 'Content-Type', /json/ )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						var json = res.body
						json.should.have.property( 'bids' )
						json.bids.should.not.be.emtpy
						var bid = json.bids[ 0 ]
						bid.should.have.property( 'id' )
						bid.should.have.property( 'user' )
						bid.should.have.property( 'event' )
						bid.should.have.property( 'region' )
						bid.should.have.property( 'created' )
						bid.should.have.property( 'modified' )
						bid.should.have.property( 'bandname' )
						bid.should.have.property( 'skill' )
						bid.should.have.property( 'managed' )
						bid.should.have.property( 'letter' )
						bid.should.have.property( 'contact' )
						bid.should.have.property( 'picture' )
						bid.should.have.property( 'picture_small' )
						bid.should.have.property( 'media' )
						bid.should.have.property( 'votes' )
						bid.should.have.property( 'notes' )
						done()
					})
			})
		})


		it( 'should only show the users bids', function ( done ) {
			auth.loginAsBand( agent, function () {
				agent
					.get( '/bids' )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.body.should.have.property( 'bids' ).with.lengthOf( 1 )
						var bid = res.body.bids[ 0 ]
						bid.bandname.should.equal( 'Rob\'n\'Roll' )
						done()
					})
			})
		})

	})




	describe( 'GET /bids/:id', function () {
		var agent
		beforeEach( function () {
			agent = request.agent( url )
		})


		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.get( '/bids/' + id )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/bids/' + id )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for the band', function ( done ) {
			auth.loginAsBand( agent, function () {
				agent
					.get( '/bids/' + id )
					.expect( 200, done )
			})
		})


		it( 'should be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.get( '/bids/' + id )
					.expect( 200, done )
			})
		})


		it( 'should be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.get( '/bids/' + id )
					.expect( 200, done )
			})
		})


		it( 'should be accessible for admin', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/bids/' + id )
					.expect( 200, done )
			})
		})


		it( 'should return votes array for friends, ini, etc.', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/bids/' + id )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.body.should.have.property( 'bids' ).with.lengthOf( 1 )
						var bid = res.body.bids[ 0 ]
						bid.should.have.property( 'votes' )
						bid.votes.should.not.be.empty
						done()
					})
			})
		})


		it( 'should not return the votes or notes array for the band', function ( done ) {
			auth.loginAsBand( agent, function () {
				agent
					.get( '/bids/' + id )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						var bid = res.body.bids[ 0 ]
						bid.should.not.have.property( 'votes' )
						bid.should.not.have.property( 'notes' )
						done()
					})
			})
		})


		it( 'should return the notes and votes array for friends, ini, etc.', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/bids/' + id )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						var bid = res.body.bids[ 0 ]
						bid.should.have.property( 'notes' )
						bid.should.have.property( 'votes' )
						done()
					})
			})
		})


		it( 'should return the only the own notes', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.get( '/bids/' + id )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						var bid = res.body.bids[ 0 ]
						bid.should.have.property( 'notes' ).with.lengthOf( 1 )
						bid.notes[ 0 ].text.should.equal( 'yeah bitch!' )
						done()
					})
			})
		})


		it( 'should return all votes for friends, ini, etc.', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.get( '/bids/' + id )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						var bid = res.body.bids[ 0 ]
						bid.should.have.property( 'votes' ).with.lengthOf( 2 )
						done()
					})
			})
		})


		it( 'should return an empty list for an unknown id', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.get( '/bids/unknown_id' )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.body.should.have.property( 'bids' ).with.lengthOf( 0 )
						done()
					})
			})
		})
	})




	describe( 'POST /bids', function () {
		var agent
		beforeEach( function () {
			agent = request.agent( url )
		})


		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.post( '/bids' )
				.expect( 401, done )
		})


		it( 'should be accessible for another band and return a well formatted json', function ( done ) {
			auth.loginAsAnotherBand( agent, function () {
				agent
					.post( '/bids' )
					.send({
						user: 'Hgwpou8k',
						event: '9egP7Q0E',
						region: '7Un4iRxj',
						bandname: 'Testband',
						skill: 'pro',
						letter: 'Hello World',
						contact: {
							name: 'foo',
							phone: '+49 123 4567890',
							mail: 'test@band.com'
						}
					})
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						var json = res.body
						json.should.have.property( 'bids' ).with.lengthOf( 1 )
						var bid = json.bids[ 0 ]
						bid.should.have.property( 'id' )
						bid.should.have.property( 'user' )
						bid.should.have.property( 'event' )
						bid.should.have.property( 'region' )
						bid.should.have.property( 'bandname' )
						bid.should.have.property( 'skill' )
						bid.should.have.property( 'letter' )
						bid.should.have.property( 'contact' )
						bid.id.should.not.be.empty
						bid.user.should.equal( 'Hgwpou8k' )
						done()
					})
			})
		})


		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.post( '/bids' )
					.send({
						user: 'U6Jp1nEf',
						event: '9egP7Q0E',
						region: '7Un4iRxj',
						bandname: 'Testband',
						skill: 'pro',
						letter: 'Hello World',
						contact: {
							name: 'foo',
							phone: '+49 123 4567890',
							mail: 'test@band.com'
						}
					})
					.expect( 403, done )
			})
		})


		it( 'should be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.post( '/bids' )
					.send({
						user: 'GNbUQQgL',
						event: '9egP7Q0E',
						region: '7Un4iRxj',
						bandname: 'Testband',
						skill: 'pro',
						letter: 'Hello World',
						contact: {
							name: 'foo',
							phone: '+49 123 4567890',
							mail: 'test@band.com'
						}
					})
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/bids' )
					.send({
						user: 'dnjnCB3T',
						event: '9egP7Q0E',
						region: '7Un4iRxj',
						bandname: 'Testband',
						skill: 'pro',
						letter: 'Hello World',
						contact: {
							name: 'foo',
							phone: '+49 123 4567890',
							mail: 'test@band.com'
						}
					})
					.expect( 403, done )
			})
		})


		it( 'should reject malformed jsons', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/bids' )
					.send( { foo: 'bar' } )
					.expect( 422, done )
			})
		})

		it( 'should reject bids different other users', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.post( '/bids' )
					.send({
						user: 'GNbUQQgL',
						event: '9egP7Q0E',
						region: '7Un4iRxj',
						bandname: 'Testband',
						skill: 'pro',
						letter: 'Hello World',
						contact: {
							name: 'foo',
							phone: '+49 123 4567890',
							mail: 'test@band.com'
						}
					})
					.expect( 403, done )
			})
		})


		it( 'should only allow one bid per account and event', function ( done ) {
			auth.loginAsBand( agent, function () {
				agent
					.post( '/bids' )
					.send({
						user: 'EMAGd8AY',
						event: '9egP7Q0E',
						region: '7Un4iRxj',
						bandname: 'Testband',
						skill: 'pro',
						letter: 'Hello World',
						contact: {
							name: 'foo',
							phone: '+49 123 4567890',
							mail: 'test@band.com'
						}
					})
					.expect( 409, done )
			})
		})
	})




	describe( 'DELETE /bids/:id', function () {
		var agent, bid = 'XgLG868X'
		beforeEach( function () {
			agent = request.agent( url )
		})



		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.del( '/bids/' + id )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.del( '/bids/' + id )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.del( '/bids/' + id )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for members of rockini', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.del( '/bids/' + id )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.del( '/bids/h8ikuujA' )
					.expect( 200, done )
			})
		})
	})




	describe( 'PUT /bids/:id', function () {
		var agent, bid

		before( function ( done ) {
			var agent = request.agent( url )
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/bids/' + id )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						bid = res.body.bids[0]
						bid.bandname = 'Robband'
						delete bid.notes
						delete bid.votes
						delete bid.media
						delete bid.contact.fb
						done()
					})
			})
		})


		beforeEach( function () {
			agent = request.agent( url )
		})


		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.put( '/bids/' + id )
				.send( bid )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.put( '/bids/' + id )
					.send( bid )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.put( '/bids/' + id )
					.send( bid )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for the owner', function ( done ) {
			auth.loginAsBand( agent, function () {
				agent
					.put( '/bids/' + id )
					.send( bid )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						var bid = res.body.bids[ 0 ]
						done()
					})
			})
		})


		it( 'should be impossible to alter the owner', function ( done ) {
			bid.user = 'U6Jp1nEf'
			auth.loginAsIni( agent, function () {
				agent
					.put( '/bids/' + id )
					.send( bid )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.put( '/bids/' + id )
					.send( bid )
					.expect( 403, done )
			})
		})

	})


})
