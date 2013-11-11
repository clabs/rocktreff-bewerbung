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
	'restless'

], function ( BB, RL ) {

	'use strict';

	RL.Model.reopen({
		// defaults
		id: RL.attr( 'string' ),
		created: RL.attr( 'date', { readOnly: true } ),
		modified: RL.attr( 'date', { readOnly: true } ),

		serialize: function( options ) {
			options = options || { }
			options.nonEmbedded = true
			return RL.get( 'client.adapter.serializer' ).serialize( this, options )
		}
	})


	BB.RESTAdapter = RL.RESTAdapter.extend({

		url: null,
		token: null,

		requestQueue: Ember.ArrayProxy.extend({
			content: Ember.A([]),
			uploads: function () {
				return this.get( 'content' ).filter( function ( req ) {
					return /POST|PUT/i.test( req.type )
				})
			}.property( 'content.length' ),
		}).create(),

		// need to reconnect Binding for the token
		// init: function () {
		// 	var self = this
		// 	var token = localStorage.token && JSON.parse( localStorage.token )
		// 	if ( token ) this.set( 'token', token.id )
		// 	Ember.run.next( function () {
		// 		self.tokenBinding.connect( self )
		// 	})
		// 	this._super()
		// },


		request: function( model, params, key ) {
			var adapter = this, serializer = this.serializer
			return new Ember.RSVP.Promise( function ( resolve, reject ) {
				params = params || {}
				params.dataType = serializer.dataType
				params.contentType = serializer.contentType
				if ( !params.url )
					params.url = adapter.buildUrl( model, key )
				if ( params.data && params.type !== 'GET' )
					params.data = serializer.prepareData( params.data )
				params.xhr = function () {
					var xhr = new window.XMLHttpRequest()
					//Upload progress
					var request = XHRUpload.create({
						type: params.type,
						xhr: xhr
					})
					adapter.get( 'requestQueue.content' ).pushObject( request )
					return xhr
				}
				params.beforeSend = function ( xhr ) {
					var token = BB.get( 'token.id' )
					if ( token )
						xhr.setRequestHeader( 'Authorization', 'Bearer ' + token )
				}
				params.success = function ( data, textStatus, jqXHR ) {
					Ember.run( null, resolve, data )
				}
				params.error = function ( jqXHR, textStatus, errorThrown ) {
					var errors = adapter.parseAjaxErrors( jqXHR, textStatus, errorThrown )
					Ember.run( null, reject, errors )
				}
				var ajax = Ember.$.ajax( params )
				if ( model ) model.set( 'currentRequest', ajax )
			})
		}
	})


	var XHRUpload = Ember.Object.extend({

		type: null,
		xhr: null,
		percent: 0,
		loaded: false,

		init: function () {
			var xhr = this.get( 'xhr' )
			xhr.upload.addEventListener( 'progress', this.progress.bind( this ), false )
			xhr.addEventListener( 'load', this.load.bind( this ), false )
		},

		progress: function ( evt ) {
			if ( !evt.lengthComputable ) return
			var percent = Math.round( evt.loaded / evt.total )
			this.set( 'percent', percent || 0 )
		},

		load: function ( evt ) {
			BB.get( 'Client.adapter.requestQueue' ).removeObject( this )
			this.destroy()
		}

	})


})
