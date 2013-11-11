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

], function ( BB ) {

	'use strict';

	BB.Dropbox = Ember.View.extend({

		value: null,
		mediatype: null,
		mimetype: '*/*',
		attributes: null,
		classNames: [ 'dropbox' ],

		// hookables
		file: function () {},
		update: function () {},
		validate: function () {},

		layout: Ember.Handlebars.compile(
			'<input class="hidden" type="file" {{action "fileselected" on="change" target=view}} >' +
			'{{yield}}'
		),

		readAsDataURL: function ( file ) {
			return new Ember.RSVP.Promise(function ( fulfill, reject ) {
				var reader = new FileReader()
				reader.onloadend = function () { fulfill( reader.result ) }
				reader.onerror = function ( err ) { reject( err ) }
				reader.readAsDataURL( file )
			})
		},


		_addHoverClass: function () {
			var node = this.$()[0]
			node.className += ' hover'
		},

		_removeHoverClass: function () {
			var node = this.$()[0]
			node.className = node.className.replace( ' hover', '' )
		},

		drop: function ( event ) {
			event.preventDefault()
			var self = this
			var node = this.$()[0]
			var file = event.dataTransfer.files[0]
			file.mediatype = this.get( 'mediatype' )
			this.file( file )
				// read as data url
				.then( this.readAsDataURL, function ( err ) {
					console.error( 'something went wrong', err )
				})
				.then( function ( url ) {
					file.data = url
					var mediatype = self.get( 'mediatype' )
					self.get( 'controller' ).send( mediatype, file )
				})

			this._removeHoverClass()
			return false
		},

		dragEnter: function ( event ) {
			this._addHoverClass()
			event.preventDefault()
			return false
		},

		dragOver: function ( event ) {
			event.preventDefault()
			return false
		},

		dragLeave: function () {
			this._removeHoverClass()
		},

		didInsertElement: function () {
			this.$().find( 'input[type^="file"]' ).attr({
				accept: this.get( 'mimetype' )
			})
			Ember.run.later( this, function () { this.update() }, 1000 )
		},

		actions: {
			selectfile: function () {
				this.$().find( 'input[type^="file"]' ).trigger( 'click' )
			},
			fileselected: function ( event ) {
				var element = window.event.srcElement
				var file = element.files[ 0 ]
				file.mediatype = this.get( 'mediatype' )
				this.file( file )
			}
		}

	})


	BB.PictureDropbox = BB.Dropbox.extend({

		valid: null,

		mediatype: 'picture',
		mimetype: 'image/*',

		update: function ( file ) {
			var self = this
			var mediatype = this.get( 'mediatype' )
			var picture = this.get( 'controller.content.' + mediatype )
			var url = file ? window.URL.createObjectURL( file ) :
				      picture ? picture.get( 'url' ) + '_small' :
				      false
			if ( picture && picture.get( 'arributes' ) ) {
				var width = picture.get( 'attributes.width' )
				var height = picture.get( 'attributes.height' )
				this.set( 'valid', this.validate( width, height ) )
				return new Ember.RSVP.Promise( function ( fulfill, reject ) {
					if ( valid ) fulfill( file )
					else reject( file )
				})
			}
			else if ( url ) {
				// set background-image property
				this.$().find( '.viewbox' ).css( 'background-image', 'url('+ url +')' )
				return this.validateURL( url )
					.then( function ( dimensions ) {
						file.attributes = {
							width: dimensions[ 0 ],
							height: dimensions[ 1 ]
						}
						self.set( 'valid', self.validate( dimensions[ 0 ], dimensions[ 1 ] ) )
						return file
					})
			}
		},

		file: function ( file ) {
			var self = this
			// if it isn't an image, jsut return
			if ( !/^image\/.+$/gi.test( file.type ) ) return
			return this.update( file )
		},

		validate: function ( width, height ) {
			return Math.max( width, height ) >= 1200
		},

		validateURL: function ( url ) {
			var self = this
			return new Ember.RSVP.Promise( function ( fulfill, reject ) {
				// update image dimensions
				var img = new Image()
				img.onload = function () {
					self.set( 'valid', self.validate( this.width, this.height ) )
					fulfill( [ this.width, this.height ] )
				}
				img.src = url
			})
		}

	})



	BB.LogoDropbox = BB.PictureDropbox.extend({
		mediatype: 'logo',
		mimetype: 'image/*'
	})


	BB.DocumentDropbox = BB.Dropbox.extend({

		mediatype: 'document',
		mimetype: 'application/*',

		file: function ( file ) {
			return new Ember.RSVP.Promise( function ( fulfill, reject ) {
				if ( !/^application\/.+$/gi.test( file.type ) )
					fulfill( file)
				else
					reject( file )
			})
		}

	})


	BB.AudioDropbox = BB.Dropbox.extend({

		mediatype: 'audio',
		mimetype: 'audio/*',

		file: function ( file ) {
			if ( !/^audio\/.*$/gi.test( file.type ) ) return
			return true
		}

	})


})
