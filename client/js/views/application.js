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

	BB.ApplicationView = Ember.ContainerView.extend({

		/**
		 * Override the default outlet connector and forward it
		 * to the child views.
		 */
		connectOutlet: function ( outletName, view ) {
			this.get( 'childViews' ).forEach( function ( childView ) {
				childView.connectOutlet( outletName, view )
			})
		},
		childViews: [
			Ember.View.extend({
				templateName: 'navbar'
			}),
			Ember.View.extend({
				templateName: 'index'
			})
		]
	})

	BB.NewView = Ember.View.extend({
		templateName: 'new'
	})

})
