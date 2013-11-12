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

	var origChangeEvent


	BB.FileInputView = Ember.View.extend( Ember.ViewTargetActionSupport, {
		tagName: 'input',
		classNames: [ 'hidden' ],
		attributeBindings: [ 'type' ],
		type: 'file',
		change: function ( evt ) {
			origChangeEvent = evt.originalEvent
			this.triggerAction({
				action: 'fileselected'
			})
		}
	})

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
			'{{view BB.FileInputView target=view}}' +
			'{{yield}}' +
			'&nbsp;'
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

		_file: function ( file ) {
			var self = this
			return new Ember.RSVP.Promise( function ( fulfill, reject ) {
				if ( self.file( file ) ) fulfill( file )
				else reject( file )
			})
		},

		_handleFile: function ( file ) {
			var self = this
			file.mediatype = this.get( 'mediatype' )
			return this._file( file )
				// read as data url
				.then( this.readAsDataURL, function ( file ) {
					console.error( 'given file does not match rules', file )
				})
				.then( function ( url ) {
					file.data = url
					var mediatype = self.get( 'mediatype' )
					self.get( 'controller' ).send( mediatype, file )
					return file
				}, function ( file ) {
					console.error( 'could not read file as data url', file )
				})
				.then( function ( file ) {
					return self.update( file )
				})
		},

		drop: function ( event ) {
			event.preventDefault()
			var node = this.$()[0]
			var file = event.dataTransfer.files[0]
			this._handleFile( file )
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
			fileselected: function () {
				var event = origChangeEvent.originalTarget || origChangeEvent.srcElement
				var file = event.files[ 0 ]
				this._handleFile( file )
				return false
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
			return new Ember.RSVP.Promise( function ( fulfill, reject ) {
				if ( file && url ) {
					// update image dimensions
					var img = new Image()
					img.onload = function () {
						self.set( 'valid', self.validate( this.width, this.height ) )
						fulfill( file )
					}
					img.src = url
				}
				else if ( picture && picture.get( 'meta' ) ) {
					var meta = picture.get( 'meta' )
					// get dimensions
					var dim = meta.split( ' ' )[ 1 ].split( 'x' ).map( parseFloat )
					self.set( 'valid', self.validate( dim[0], dim[1] ) )
					fulfill( file )
				}
				else reject( file )
			})
			.then( function ( file ) {
				// set background-image property
				self.$().find( '.viewbox' ).css( 'background-image', 'url('+ url +')' )
				return file
			})
		},

		file: function ( file ) {
			return (/^image\/.+$/gi).test( file.type )
		},

		validate: function ( width, height ) {
			return Math.max( width, height ) >= 1200
		},

		validateURL: function ( url ) {
			var self = this

		}

	})



	BB.LogoDropbox = BB.PictureDropbox.extend({
		mediatype: 'logo',
		mimetype: 'image/*'
	})


	BB.DocumentDropbox = BB.Dropbox.extend({

		mediatype: 'document',
		mimetype: '*',

		file: function ( file ) {
			return (/^.+?\/.+$/gi).test( file.type )
		}

	})


	BB.AudioDropbox = BB.Dropbox.extend({

		mediatype: 'audio',
		mimetype: 'audio/*',

		file: function ( file ) {
			return (/^audio\/.*$/gi).test( file.type )
		}

	})


})
