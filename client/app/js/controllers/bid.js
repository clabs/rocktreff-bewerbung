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

		phonevalid: function () {
			var phone = this.get( 'content.phone' )
			return /^[\d\(\)\/\-\s]{7,}$/.test( phone )
		}.property( 'content.phone' ),

		mailvalid: function () {
			var mail = this.get( 'content.mail' )
			return /^[A-Za-z0-9](([_\.\-]?[a-zA-Z0-9]+)*)@([A-Za-z0-9]+)(([\.\-]?[a-zA-Z0-9]+)*)\.([A-Za-z]{2,})$/.test( mail )
		}.property( 'content.mail' ),




		autoSave: function () {
			this.save()
		}.debounce( 3000 ).observes( 'content.isDirty' ),

		save: function () {
			this.get( 'content' ).saveRecord()
		},

		actions: {
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
					this.send( 'mediacreate', file, item )
					return
				}
				var properties = {
					bid: bid.get( 'id' ),
					type: file.mediatype,
					attributs: file.attributes,
					mimetype: file.type,
					filename: file.name,
					filesize: file.size,
					data: file.data
				}
				mediaitem.setProperties( properties )
				mediaitem
					.saveRecord()
					.then( function () {
						Ember.run.later( bid, bid.reloadRecord, 100 )
					})

			},
			mediacreate: function ( file, item ) {
				var bid = this.get( 'content' )
				var properties = {
					bid: bid.get( 'id' ),
					type: file.mediatype,
					attributs: file.attributes,
					mimetype: file.type,
					filename: file.name,
					filesize: file.size,
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
			playaudio: function ( media ) {
				this.get( 'controllers.audioplayer' ).load( media )
			}
		}

	})
})
