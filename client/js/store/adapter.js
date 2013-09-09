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
	'restless',
	'socketio'

], function ( BB, RL, io ) {

	'use strict';

	BB.SocketAdapter = RL.Adapter.extend({

		/*
		 * socket: socket object to backend service
		 */
		socket: Ember.computed( function () {
			var options = this.get( 'socket_options' )
			var host = this.get( 'host' )
			var port = this.get( 'port' )
			var uri = '%@:%@'.fmt( host, port )
			return io.connect( uri, options )
		}).property( 'host', 'port' ),


		// options go here
		socket_options: { },

		/*
		 * serializer: default to a JSON serializer
		 */
		serializer: RL.JSONSerializer.create(),

		/*
		 * host: base url of backend service
		 */
		host: null,

		/**
		 * port: tcp port of backend service
		 */
		port: 80,

		/*
		 * namespace: endpoint path
		 * example: 'api/v1'
		 */
		namespace: null,

		/*
		 * useContentTypeExtension: forces content type extensions on resource requests
		 */
		useContentTypeExtension: false,


		/*
		 * App.Post => 'posts',  App.PostGroup => 'post_groups'
		 */
		pluralize: function( name ) {
			return this.pluralize( Ember.String.decamelize( name ) )
		},


		/*
		 * send: creates and executes a socket event wrapped in a promise
		 */
		send: function ( model, options ) {
			var self = this
			var serializer = this.serializer
			var socket = this.get( 'socket' )
			var data = model.serialize()
			var name = this.pluralize( model )
			var eventname = '%@:%@'.fmt( name, options.action )
			return new Ember.RSVP.Promise( function ( resolve ) {
				socket.emit( eventname, data, function ( data ) {
					Ember.run( null, resolve, data )
				})
			})
		},

		/*
		 * saveRecord: POSTs a new record, or PUTs an updated record to REST service
		 */
		saveRecord: function( record ) {
			var isNew = record.get( 'isNew' )
			var method
			var promise
			// if an existing model isn't dirty, no need to save
			if ( !isNew && !record.get( 'isDirty' ) )
				return new Ember.RSVP.Promise( function ( resolve ) { resolve( record ) } )
			// update state
			record.set( 'isSaving', true )
			// return 
			return this.send( record, isNew ? 'create' : 'update' )
				.then( function ( data ) {
					if ( data ) record.deserialize( data )
					record.onSaved( isNew )
					return record
				}, function ( error ) {
					record.onError( error )
					return error
				})
		},

		deleteRecord: function( record ) {
			return this.send( record, 'delete' )
				.then( function () {
					record.onDeleted()
					return null
				}, function ( error ) {
					record.onError( error )
					return error
				})
		},

		reloadRecord: function( record ) {
			var primaryKey = record.constructor.get( 'primaryKey' )
			var key = record.get( primaryKey )
			// Can't reload a record that hasn't been stored yet (no primary key)
			if( Ember.isNone( key ) )
				return new Ember.RSVP.Promise( function ( _, reject ) { reject() } )
			record.set( 'isLoaded', false )
			return this.send( record, read, key )
				.then( function ( data ){
					record.deserialize( data )
					record.onLoaded()
				}, function ( error ) {
					record.onError( error )
				})
		},

		findAll: function( type ) {
			return this.findQuery( type )
		},

		findQuery: function ( recordtype, query ) {
			var type = recordtype.toString()
			var resource = recordtype.create({ isNew: false })
			var result = RL.RecordArray.createWithContent()
			this.send( resource, 'read', query )
				.then( function ( data ) {
					result.deserializeMany( type, data )
					result.onLoaded()
				}, function ( error ) {
					result.onError( error )
				})
			return result
		},

		findByKey: function( recordtype, key, query ) {
			var result = recordtype.create({ isNew: false })
			this.send( result, 'read', query, key )
				.then( function ( data ) {
					result.deserialize( data )
					result.onLoaded()
				}, function ( error ) {
					result.onError( error )
				})
			return result
		},

		/*
		 * fetch: wraps find method in a promise for async find support
		 * Overridden to add currentRequest
		 */
		fetch: function( recordtype, params ) {
			var self = this
			return new Ember.RSVP.Promise( function ( resolve, reject ) {
				self.find( recordtype, params )
					.one( 'didLoad', function ( model ) { resolve( model ) } )
					.one( 'becameError', function ( error ) { reject( error ) } )
			})
		},

		/*
		 * registerTransform: fowards custom tranform creation to serializer
		 */
		registerTransform: function( type, transform ) {
			this.get( 'serializer' ).registerTransform( type, transform )
		}
	})


})
