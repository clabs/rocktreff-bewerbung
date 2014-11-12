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
	'data'

], function ( BB ) { 'use strict';

	var DS = window.DS

	Ember.Inflector.inflector.irregular( 'media', 'media' )

	BB.RequestQueue = Ember.ArrayProxy.extend({
		content: Ember.A(),

		addRequest: function ( hash ) {
			var req = XHRUpload.create( hash )
			this.get( 'content' ).pushObject( req )
		},

		uploads: function () {
			return this.get( 'content' ).filter( function ( req ) {
				return (/POST|PUT/i).test( req.type )
			})
		}.property( 'content.length' )


	})



	BB.RESTSerializer = DS.RESTSerializer.extend({
		serializeIntoHash: function ( hash, type, record, options ) {
			var data = this.serialize( record, options )
			// skip null values
			for ( var key in data ) {
				if ( data[key] === null ) continue
				hash[key] = data[key]
			}
		},
		serializeAttribute: function( record, json, key, attribute ) {
			if (attribute.options && attribute.options.readOnly) {
				return
			} else {
				this._super( record, json, key, attribute )
			}
		}
	})


	BB.requestQueue = BB.RequestQueue.create()

	BB.RESTAdapter = DS.RESTAdapter.extend({

		ajax: function( url, type, hash ) {
			var adapter = this
			return new Ember.RSVP.Promise( function( fulfill, reject ) {
				hash = hash || {}
				hash.url = url
				hash.type = type
				hash.dataType = 'json'
				hash.context = adapter

				if ( hash.data && type !== 'GET' ) {
					hash.contentType = 'application/json; charset=utf-8';
					hash.data = JSON.stringify( hash.data )
				}

				if ( adapter.headers !== undefined ) {
					var headers = adapter.headers
					hash.beforeSend = function ( xhr ) {
						Ember.keys( headers ).forEach( function ( key ) {
							xhr.setRequestHeader( key, headers[ key ] )
						})
					}
				}

				hash.xhr = function () {
					var xhr = new window.XMLHttpRequest()
					var isUpload = ( hash.type === 'POST' || hash.type === 'PUT' ) && hash.data.length > 1e4
					//Upload progress
					BB.requestQueue.addRequest({
						upload: isUpload,
						type: hash.type,
						xhr: xhr
					})
					return xhr
				}

				hash.success = function( json ) {
					Ember.run( null, fulfill, json )
				}

				hash.error = function( jqXHR, textStatus, errorThrown ) {
					Ember.run( null, reject, adapter.ajaxError(jqXHR) )
				}
				Ember.$.ajax( hash )
			})
		}
	})


	var XHRUpload = Ember.Object.extend({

		upload: false,
		type: null,
		xhr: null,
		percent: 0,
		loaded: false,
		percentStyle: 'width:0%',
		msg: '',

		init: function () {
			var xhr = this.get( 'xhr' )
			xhr.upload.addEventListener( 'progress', this.progress.bind( this ), false )
			xhr.addEventListener( 'load', this.load.bind( this ), false )
		},

		progress: function ( evt ) {
			if ( !evt.lengthComputable ) return
			var isUpload = this.get( 'upload' )
			var percent = ( evt.loaded / evt.total * 100 ) || 0
			this.setProperties({
				percent: percent,
				percentStyle: 'width: '+ percent + '%',
				msg: percent >= 100 && isUpload ? 'Bearbeite …' : ''
			})
		},

		load: function ( evt ) {
			BB.requestQueue.removeObject( this )
			this.destroy()
		}

	})


})
