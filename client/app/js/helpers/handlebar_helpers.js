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

	'ember',
	'utils/md5',
	'moment'

],function ( Ember, md5, moment ) {

	'use strict';

	moment.lang( 'de' )

	Ember.Handlebars.registerHelper( 'icon', function ( type ) {
		var string = '<i class="fa fa-%@"></i>'.fmt( type )
		return new Ember.Handlebars.SafeString( string )
	})

	Ember.Handlebars.registerBoundHelper( 'gravatar', function ( email, options ) {
		var hash = md5( email || 'some@one.com' )
		var size = options.hash.size || 32
		var img = '<img src="https://gravatar.com/avatar/%@?s=%@&d=mm" alt="Gravatar">'.fmt( hash, size )
		return new Ember.Handlebars.SafeString( img )
	})

	Ember.Handlebars.registerBoundHelper( 'fromNow', function ( datestring ) {
		var date = new Date( datestring )
		return moment( date ).fromNow()
	})

	Ember.Handlebars.registerBoundHelper( 'calendar', function ( datestring ) {
		var date = new Date( datestring )
		return moment( date ).calendar()
	})


	Ember.Handlebars.registerHelper('group', function(options) {
	  var data = options.data,
		  fn   = options.fn,
		  view = data.view,
		  childView;

	  childView = view.createChildView(Ember._MetamorphView, {
		context: view.get( 'context' ),

		template: function(context, options) {
		  options.data.insideGroup = true;
		  return fn(context, options);
		}
	  })

	  view.appendChild(childView)
	})


})
