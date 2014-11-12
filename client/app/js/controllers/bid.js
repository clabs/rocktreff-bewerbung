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

	'bb',
	'models/models'

], function ( BB ) {

	'use strict';


	BB.BidsController = Ember.ArrayController.extend({

		track: function () {
			var bid = this.get( 'content.0' )
			if ( bid ) {
				return bid.get( 'track' )
			}
		}.property( 'content' )

	})


	BB.BidDetailsController = Ember.ObjectController.extend({

		needs: [ 'lightbox', 'audioplayer' ],

		tracks: [],
		_lasttrack: null,
		trackChanged: function () {
			var bid = this.get( 'content' )
			var track = bid.get( 'track' )
			if ( track !== this.get( '_lasttrack' ) ) {
				this.set( '_lasttrack', track )
				bid.save()
			}
		}.observes( 'content.track' ),

		ratingIsNone: Ember.computed.equal( 'content.vote.rating', 0 ),
		ratingIsOne: Ember.computed.equal( 'content.vote.rating', 1 ),
		ratingIsTwo: Ember.computed.equal( 'content.vote.rating', 2 ),
		ratingIsThree: Ember.computed.equal( 'content.vote.rating', 3 ),
		ratingIsFour: Ember.computed.equal( 'content.vote.rating', 4 ),
		ratingIsFive: Ember.computed.equal( 'content.vote.rating', 5 ),

		actions: {
			rate: function ( rating ) {
				var bid = this.get( 'content' )
				var vote = bid.get( 'vote' )
				if ( !vote ) {
					vote = this.store.createRecord( 'vote', {
						user: this.get( 'auth.user' ),
						bid: bid,
						rating: rating
					})
					vote.save().then( function () {
						bid.get( 'votes' ).addObject( vote )
					})
				} else {
					vote.set( 'rating', rating ).save()
				}
			},
			playaudio: function ( media ) {
				this.get( 'controllers.audioplayer' ).load( media )
			},
			showDetails: function ( bid ) {
				this.transitionToRoute( 'BidDetails', bid )
			}
		}
	})


	BB.BidController = Ember.ObjectController.extend({

		needs: [ 'audioplayer' ],
		youtubelink: '',


		phonevalid: function () {
			var phone = this.get( 'content.phone' )
			var regexp = /^[\d\(\)\/\-\s]{7,}$/
			return regexp.test( phone )
		}.property( 'content.phone' ),

		mailvalid: function () {
			var mail = this.get( 'content.mail' )
			var regexp = /^[A-Za-z0-9](([_\.\-]?[a-zA-Z0-9]+)*)@([A-Za-z0-9]+)(([\.\-]?[a-zA-Z0-9]+)*)\.([A-Za-z]{2,})$/
			return regexp.test( mail )
		}.property( 'content.mail' ),

		musicComplete: function () {
			return this.get( 'content.audio.length' ) >= 3
		}.property( 'content.audio.length' ),

		docComplete: function () {
			return this.get( 'content.documents.length' ) >= 1
		}.property( 'content.documents.length' ),

		urlvalid: function () {
			var url = this.get( 'content.url' )
			var regexp = /^https?:\/\/.+$/
			return regexp.test( url ) || url === ''
		}.property( 'content.url' ),

		fbvalid: function () {
			var url = this.get( 'content.fb' )
			var regexp = /^https?:\/\/www\.facebook\.com\/.+$/
			return regexp.test( url ) || url === ''
		}.property( 'content.fb' ),

		hasURL: function () {
			var urlvalid = this.get( 'urlvalid' )
			var fbvalid = this.get( 'fbvalid' )
			var url = this.get( 'content.url' )
			var fb = this.get( 'content.fb' )
			return ( urlvalid && url !== '' ) || ( fbvalid && fb !== '' )
		}.property( 'urlvalid', 'fbvalid', 'content.fb', 'content.url' ),


		autoSave: function () {
			console.log( 'autosave disabled' ) // this.save()
		}.debounce( 3000 ).observes( 'content.isDirty' ),

		save: function () {
			this.get( 'content' ).save()
		},

		actions: {
			open: function ( url ) {
				window.open( url, '_blank' )
			},
			saveBid: function () {
				this.save()
			},
			mediaremove: function ( mediaitem ) {
				var bid = this.get( 'content' )
				mediaitem.deleteRecord()
				mediaitem.save()
					.then( function () {
						bid.get( 'media' ).removeObject( mediaitem )
						Ember.run.later( bid, bid.reloadRecord, 100 )
					})
			},
			mediaupdate: function ( file, item ) {
				var bid = this.get( 'content' )
				var mediaitem = this.get( item )
				if ( !mediaitem ) {
					this.send( 'mediacreate', file )
					return
				}
				var properties = {
					bid: bid.get( 'id' ),
					type: file.mediatype,
					mimetype: file.type,
					filename: file.name,
					filesize: file.size,
					url: file.url,
					blob: file.data
				}
				mediaitem.setProperties( properties )
				mediaitem.save()
					.then( function () {
						Ember.run.later( bid, bid.reloadRecord, 100 )
					})

			},
			mediacreate: function ( file ) {
				var bid = this.get( 'content' )
				var properties = {
					bid: bid,
					type: file.mediatype,
					mimetype: file.type,
					filename: file.name,
					filesize: file.size,
					url: file.url,
					blob: file.data
				}
				var mediaitem = this.store.createRecord( 'media', properties )
				mediaitem.save()
					.then(function () {
						bid.get( 'media' ).addObject( mediaitem )
						Ember.run.later( bid, bid.reloadRecord, 100 )
					})

			},
			picture: function ( file ) {
				this.send( 'mediaupdate', file, 'picture' )
			},
			logo: function ( file ) {
				this.send( 'mediaupdate', file, 'logo' )
			},
			document: function ( file ) {
				this.send( 'mediacreate', file, 'document' )
			},
			audio: function ( file ) {
				this.send( 'mediacreate', file, 'audio' )
			},
			link: function () {
				var file = {
					url: this.get( 'youtubelink' ),
					mediatype: 'youtube',
					type: '',
					name: '',
					size: 0
				}
				this.send( 'mediacreate', file )
				this.set( 'youtubelink', '' )
			},
			playaudio: function ( media ) {
				this.get( 'controllers.audioplayer' ).load( media )
			}
		}

	})
})
