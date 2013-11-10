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

], function ( BB ) {

	'use strict';


	RL.Model.reopen({

		id: RL.attr( 'string' ),

		serialize: function( options ) {
			options = options || { }
			options.nonEmbedded = true
			return RL.get( 'client.adapter.serializer' ).serialize( this, options )
		}

	})


	BB.RESTAdapter = RL.RESTAdapter.create({

		url: 'http://localhost:1338',
		accesstokenBinding: 'BB.Auth.token',

		persistToken: function () {
			var token = this.get( 'accesstoken' ), json = null
			try { json = JSON.stringify( token ) }
			catch ( e ) { console.error( e ) }
			finally { window.localStorage.setItem( 'accesstoken', json ) }
		},


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
				params.beforeSend = function ( xhr ) {
					if ( adapter.accesstoken )
						xhr.setRequestHeader( 'Authorization', 'Bearer ' + adapter.accesstoken.id )
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


	BB.RESTAdapter.registerTransform( 'isodate', {
		deserialize: function ( datestring ) {
			return new Date( datestring )
		},
		serialize: function ( obj ) {
			if ( typeof obj === 'string' )
				return ( new Date( obj ) ).toISOString()
			if ( typeof obj === 'date' )
				return obj.toISOString()
			else
				return obj.toString()
		}
	})


})
