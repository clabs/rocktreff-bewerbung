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



	BB.BidController = Ember.ObjectController.extend({

		needs: [ 'audioplayer' ],


		youtubelink: '',



		phonevalid: function () {
			var phone = this.get( 'content.phone' )
			return /^[\d\(\)\/\-\s]{7,}$/.test( phone )
		}.property( 'content.phone' ),

		mailvalid: function () {
			var mail = this.get( 'content.mail' )
			return /^[A-Za-z0-9](([_\.\-]?[a-zA-Z0-9]+)*)@([A-Za-z0-9]+)(([\.\-]?[a-zA-Z0-9]+)*)\.([A-Za-z]{2,})$/.test( mail )
		}.property( 'content.mail' ),

		musicComplete: function () {
			return this.get( 'content.audio.length' ) >= 3
		}.property( 'content.audio.length' ),

		docComplete: function () {
			return this.get( 'content.documents.length' ) >= 1
		}.property( 'content.documents.length' ),

		urlvalid: function () {
			var url = this.get( 'content.url' )
			return /^https?:\/\/.+$/.test( url ) || url === ''
		}.property( 'content.url' ),

		fbvalid: function () {
			var url = this.get( 'content.fb' )
			return /^https?:\/\/www\.facebook\.com\/.+$/.test( url ) || url === ''
		}.property( 'content.fb' ),

		hasURL: function () {
			var urlvalid = this.get( 'urlvalid' )
			var fbvalid = this.get( 'fbvalid' )
			var url = this.get( 'content.url' )
			var fb = this.get( 'content.fb' )
			return ( urlvalid && url !== '' ) || ( fbvalid && fb !== '' )
		}.property( 'urlvalid', 'fbvalid', 'content.fb', 'content.url' ),


		autoSave: function () {
			this.save()
		}.debounce( 3000 ).observes( 'content.isDirty' ),

		save: function () {
			this.get( 'content' ).saveRecord()
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
					data: file.data
				}
				mediaitem.setProperties( properties )
				mediaitem
					.saveRecord()
					.then( function () {
						Ember.run.later( bid, bid.reloadRecord, 100 )
					})

			},
			mediacreate: function ( file ) {
				var bid = this.get( 'content' )
				var properties = {
					bid: bid.get( 'id' ),
					type: file.mediatype,
					mimetype: file.type,
					filename: file.name,
					filesize: file.size,
					url: file.url,
					data: file.data
				}
				var mediaitem = BB.Media.create( properties )
				mediaitem
					.saveRecord()
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
