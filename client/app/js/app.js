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
	'models/models',
	'store/ds_adapter',

], function ( BB ) {

	'use strict';

	Ember.deprecate = function () {}

	var HOSTNAME = 'https://api.rocktreff.de'

	BB.reopen({

		ApplicationAdapter: BB.RESTAdapter.extend({
			host: HOSTNAME
		}),

		ApplicationSerializer: BB.RESTSerializer.extend(),

		Auth: window.RT.Auth.extend({
			host: HOSTNAME,
			facebook_redirect_uri: HOSTNAME + '/auth/facebook/callback',
			facebook_client_id: 528637637210887
		}),

		events: null,
		currentEvent: function () {
			var events = this.get( 'events' )
			if ( events ) {
				return events.objectAt( 0 )
			}
		}.property( 'events' ),

		title: '',
		titleChanged: function () {
			var title = ''
			if ( this.get( 'title' ) )
				title += this.get( 'title' ) + ' - '
			title += 'Rocktreff Bandbewerbung'
			$( 'title' ).text( title )
			// chrome bug workaround see: http://stackoverflow.com/questions/2952384/changing-the-window-title-when-focussing-the-window-doesnt-work-in-chrome
			Ember.run.later( function () {
				document.title = '.'
				document.title = title
			}, 200 )
		}.observes( 'title' )

	})


	document.body.addEventListener( 'touchmove', function ( ev ) {
		//ev.preventDefault()
	})


	BB.advanceReadiness()

})
