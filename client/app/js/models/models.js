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
define([

	'bb'

], function ( BB ) { 'use strict';

	var DS = window.DS

	BB.ISODateTransform = DS.Transform.extend({
		deserialize: function ( datestring ) {
			return new Date( datestring )
		},
		serialize: function ( obj ) {
			if ( typeof obj === 'string' )
				return ( new Date( obj ) ).toISOString()
			if ( typeof obj === 'date' )
				return obj.toISOString()
			if ( obj !== undefined )
				return obj.toString()
		}
	})


	BB.User = DS.Model.extend({
		name: DS.attr( 'string' ),
		password: DS.attr( 'string' ),
		email: DS.attr( 'string' ),
		provider: DS.attr( 'string' ),
		role: DS.attr( 'string' ),
		picture: DS.attr( 'string' ),

		displayName: function () {
			try {
				return this.get( 'name' ).trim() || this.get( 'email' )
			} catch (e) {
				return ''
			}
		}.property( 'name', 'email' ),

		isMe: function () {
			return this.get( 'id' ) === BB.get( 'auth.userId' )
		}.property( 'BB.auth.userId' ),
		isAdmin: Ember.computed.equal( 'role', 'admin' ),
		isCrew: Ember.computed.equal( 'role', 'crew' ),
		isNeither: Ember.computed.equal( 'role', '' )
	})


	BB.Event = DS.Model.extend({
		name: DS.attr( 'string' ),
		opening_date: DS.attr( 'ISODate' ),
		closing_date: DS.attr( 'ISODate' ),
		tracks: DS.hasMany( 'track', { inverse: 'event' } )
	})


	BB.Track = DS.Model.extend({
		name: DS.attr( 'string' ),
		event: DS.belongsTo( 'event' ),
		visible: DS.attr( 'boolean' )
	})


	BB.Region = DS.Model.extend({
		name: DS.attr( 'string' )
	})


	BB.Media = DS.Model.extend({
		bid: DS.belongsTo( 'bid', { async: true } ),
		type: DS.attr( 'string' ),
		url: DS.attr( 'string' ),
		meta: DS.attr( 'string' ),
		mimetype: DS.attr( 'string' ),
		filename: DS.attr( 'string' ),
		filesize: DS.attr( 'number' ),
		blob: DS.attr( 'string' )
	})


	BB.Vote = DS.Model.extend({
		user: DS.belongsTo( 'user' ),
		bid: DS.belongsTo( 'bid' ),
		rating: DS.attr( 'number' )
	})


	BB.Note = DS.Model.extend({
		user: DS.belongsTo( 'user' ),
		bid: DS.belongsTo( 'bid' ),
		type: DS.attr( 'string' ),
		text: DS.attr( 'string' )
	})


	BB.Bid = DS.Model.extend({
		created: DS.attr( 'ISODate' ),
		modified: DS.attr( 'ISODate' ),
		event: DS.belongsTo( 'event', { async: true } ),
		track: DS.belongsTo( 'track' ),
		region: DS.belongsTo( 'region', { async: true } ),
		bandname: DS.attr( 'string' ),
		style: DS.attr( 'string' ),
		student: DS.attr( 'boolean' ),
		managed: DS.attr( 'boolean' ),
		letter: DS.attr( 'string' ),
		contact: DS.attr( 'string' ),
		phone: DS.attr( 'string' ),
		mail: DS.attr( 'string' ),
		url: DS.attr( 'string' ),
		fb: DS.attr( 'string' ),
		media: DS.hasMany( 'media', { inverse: 'bid' }  ),
		votes: DS.hasMany( 'vote', { inverse: 'bid' }  ),
		notes: DS.hasMany( 'note', { inverse: 'bid' }  ),

		// computed lists & stuff
		vote: function () {
			var user = BB.__container__.lookup('controller:bids').get( 'auth.user' )
			return this.get( 'votes.content' ).filterBy( 'user', user ).get( 'firstObject' )
		}.property( 'votes.content.length' ),

		all_votes: function () {
			return this.get( 'votes' )
				.mapBy( 'rating' )
				.reduce( function ( list, vote ) {
					if ( vote in list )
						list[ vote ] += 1
					else
						list[ vote ] = 1
					return list
				}, [] )
				.map( function ( sum, index ) {
					var stars = ''
					for ( var i = 0; i < index; i += 1 )
						stars += '\u2605'
					return sum + ' ' + stars
				})
				.join( ', ' )
		}.property( 'votes.content.length' ),

		score: function () {
			var votes = this.get( 'votes' ).mapBy( 'rating' )
			var sum = votes.reduce( function ( a, b ) { return a + b }, 0 )
			var num = votes.length
			return num > 0 ? sum / num : 0
		}.property( 'votes.content.length' ),

		score_formatted: function () {
			return this.get( 'score' ).toFixed( 3 )
		}.property( 'score' ),

		num_votes: function () {
			return this.get( 'votes.content.length' )
		}.property( 'votes.content.length' ),

		picture: function () {
			return this.get( 'media.content' ).filterBy( 'type', 'picture' ).get( 'firstObject' )
		}.property( 'media.content.length' ),

		logo: function () {
			return this.get( 'media.content' ).filterBy( 'type', 'logo' ).get( 'firstObject' )
		}.property( 'media.content.length' ),

		documents: function () {
			return this.get( 'media.content' ).filterBy( 'type', 'document' ) || Ember.A()
		}.property( 'media.content.length' ),

		audio: function () {
			return this.get( 'media.content' ).filterBy( 'type', 'audio' ) || Ember.A()
		}.property( 'media.content.length' ),

		youtube: function () {
			return this.get( 'media.content' ).filterBy( 'type', 'youtube' ) || Ember.A()
		}.property( 'media.content.length' )

	})


})
