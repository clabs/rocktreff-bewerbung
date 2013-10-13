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

var id = 't8ENk1nG'


describe( 'Notes', function () {


	describe( 'GET /notes', function () {
		var agent = request.agent( url )


		it( 'should not be accessible without authentication', function ( done ) {
			agent
				.get( '/notes' )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/notes' )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.get( '/notes' )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.get( '/notes' )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/notes' )
					.expect( 200, done )
			})
		})


		it( 'should return a well formatted json', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/notes' )
					.expect( 'Content-Type', /json/ )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						var json = res.body
						json.should.have.property( 'notes' )
						json.notes.should.not.be.emtpy
						var note = json.notes[ 0 ]
						note.should.have.property( 'id' )
						note.should.have.property( 'user' )
						note.should.have.property( 'bid' )
						note.should.have.property( 'type' )
						note.should.have.property( 'text' )
						done()
					})
			})
		})
	})




	describe( 'GET /notes/:id', function () {
		var agent
		beforeEach( function () {
			agent = request.agent( url )
		})


		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.get( '/notes/' + id )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.get( '/notes/' + id )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.get( '/notes/' + id )
					.expect( 200, done )
			})
		})


		it( 'should be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.get( '/notes/' + id )
					.expect( 200, done )
			})
		})


		it( 'should be accessible for admin', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/notes/' + id )
					.expect( 200, done )
			})
		})


		it( 'should return the correct json object', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.get( '/notes/' + id )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						var json = res.body
						json.should.have.property( 'notes' ).with.lengthOf( 1 )
						var note = json.notes[ 0 ]
						note.should.have.property( 'id' )
						note.should.have.property( 'user' )
						note.should.have.property( 'bid' )
						note.should.have.property( 'type' )
						note.should.have.property( 'text' )
						note.id.should.equal( id )
						note.user.should.not.be.empty
						note.bid.should.not.be.empty
						note.type.should.not.be.empty
						done()
					})
			})
		})


		it( 'should return an empty list for an unknown id', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.get( '/notes/unknown_id' )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.body.should.have.property( 'notes' ).with.lengthOf( 0 )
						done()
					})
			})
		})
	})




	describe( 'POST /notes', function () {
		var agent, bid = 'XgLG868X'
		beforeEach( function () {
			agent = request.agent( url )
		})


		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.post( '/notes' )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.post( '/notes' )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.post( '/notes' )
					.send( { user: 'U6Jp1nEf', bid: bid, type: 'memo', text: 'yay!' } )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						var newid = res.body.notes[ 0 ].id
						agent
							.del( '/notes/' + newid )
							.expect( 200 )
						done()
					})
			})
		})


		it( 'should be accessible for members of rockini', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.post( '/notes' )
					.send( { user: 'GNbUQQgL', bid: bid, type: 'memo', text: 'yay!' } )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						var newid = res.body.notes[ 0 ].id
						agent
							.del( '/notes/' + newid )
							.expect( 200 )
						done()
					})
			})
		})


		it( 'should be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/notes' )
					.send( { user: 'dnjnCB3T', bid: bid, type: 'memo', text: 'yay!' } )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						var newid = res.body.notes[ 0 ].id
						agent
							.del( '/notes/' + newid )
							.expect( 200 )
						done()
					})
			})
		})


		it( 'should reject malformed jsons', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/notes' )
					.send( { bid: bid, type: 'blob', text: 'yay large blob!' } )
					.expect( 422, done )
			})
		})

		it( 'should reject notes for other users', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/notes' )
					.send( { user: 'someone', bid: bid, type: 'memo', text: 'yay!' } )
					.expect( 403, done )
			})
		})


		it( 'should return a wellformed json object', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/notes' )
					.send( { user: 'dnjnCB3T', bid: bid, type: 'memo', text: 'yay!' } )
					.expect( 'Content-Type', /json/ )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						res.should.be.json
						var json = res.body
						json.should.have.property( 'notes' ).with.lengthOf( 1 )
						var note = json.notes[ 0 ]
						note.should.have.property( 'id' )
						note.should.have.property( 'user' )
						note.should.have.property( 'bid' )
						note.should.have.property( 'type' )
						note.should.have.property( 'text' )
						note.id.should.not.be.empty
						note.user.should.equal( 'dnjnCB3T' )
						note.bid.should.equal( bid )
						note.type.should.match( /flag.?|memo$/ )
						var id = note.id
						agent
							.del( '/notes/' + id )
							.expect( 200 )
						done()
					})
			})
		})
	})




	describe( 'DELETE /notes/:id', function () {
		var agent, bid = 'XgLG868X'
		beforeEach( function () {
			agent = request.agent( url )
		})



		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.del( '/notes/' + id )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.del( '/notes/' + id )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.del( '/notes/' + id )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for members of rockini', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.del( '/notes/' + id )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.post( '/notes' )
					.send( { user: 'dnjnCB3T', bid: bid, type: 'memo', text: 'yay!' } )
					.end( function ( err, res ) {
						should.not.exist( err )
						var id = res.body.notes[ 0 ].id
						agent
							.del( '/notes/' + id )
							.expect( 200, done)
					})
			})
		})
	})




	describe( 'PUT /notes/:id', function () {
		var agent, uid = 'GNbUQQgL', bid = 'XgLG868X'
		beforeEach( function () {
			agent = request.agent( url )
		})

		it( 'should not be accessible for anyone', function ( done ) {
			agent
				.put( '/notes/' + id )
				.send( { id: id, user: uid, bid: bid, type: 'memo', text: 'yay!' } )
				.expect( 401, done )
		})


		it( 'should not be accessible for someone', function ( done ) {
			auth.loginAsSomeone( agent, function () {
				agent
					.put( '/notes/' + id )
					.send( { id: id, user: uid, bid: bid, type: 'memo', text: 'yay!' } )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for friends', function ( done ) {
			auth.loginAsFriend( agent, function () {
				agent
					.put( '/notes/' + id )
					.send( { id: id, user: uid, bid: bid, type: 'memo', text: 'yay!' } )
					.expect( 403, done )
			})
		})


		it( 'should be accessible for the owner', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.put( '/notes/' + id )
					.send( { id: id, user: uid, bid: bid, type: 'memo', text: 'yay ho!' } )
					.expect( 200 )
					.end( function ( err, res ) {
						should.not.exist( err )
						var note = res.body.notes[ 0 ]
						note.text.should.equal( 'yay ho!' )
						done()
					})
			})
		})


		it( 'should be impossible to alter the owner', function ( done ) {
			auth.loginAsIni( agent, function () {
				agent
					.put( '/notes/' + id )
					.send( { id: id, user: 'U6Jp1nEf', bid: bid, type: 'memo', text: 'yay!' } )
					.expect( 403, done )
			})
		})


		it( 'should not be accessible for admins', function ( done ) {
			auth.loginAsAdmin( agent, function () {
				agent
					.put( '/notes/' + id )
					.send( { id: id, user: uid, bid: bid, type: 'memo', text: 'yay!' } )
					.expect( 403, done )
			})
		})

	})


})
