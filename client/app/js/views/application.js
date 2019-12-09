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
		classNames: [ 'viewport' ],
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
				tagName: 'nav',
				classNames: [ 'navbar', 'navbar-fixed-top', 'navbar-inverse' ],
				templateName: 'navbar'
			}),
			Ember.View.extend({
				templateName: 'index'
			})
		]
	})



	BB.HomeView = Ember.View.extend({
		classNames: [ 'home' ]
	})



	BB.BidView =  Ember.View.extend({
		classNames: [ 'bid' ]
	})

	BB.BidsView = BB.UnreviewedView = BB.IncompleteView = Ember.View.extend({
		classNames: [ 'bids' ]
	})

	BB.BidDetailsView = Ember.View.extend({
		templateName: 'bids/details',

		didInsertElement: function () {
			this.$().closest( '.bids' ).addClass('rightpush')
		},

		willDestroyElement: function () {
			this.$().closest( '.bids' ).removeClass('rightpush')
		}
	})


	BB.StarRatingView = Ember.View.extend({
		templateName: 'starrating'
	})

	BB.BandPictureView = Ember.View.extend({
		classNames: [ 'bandpicture' ],
		templateName: 'bids/bandpicture',
		attributeBindings: [ 'style' ],

		style: function () {
			var url = this.get( 'controller.content.picture.url' ) || this.get( 'controller.content.logo.url' )
			return url ? 'background-image:url('+url+'_small)' : ''
		}.property( 'controller.content.picture', 'controller.content.logo' ),

		eventManager: {
			click: function ( event, view ) {
				var pic = view.get( 'controller.content.picture' ) || view.get( 'controller.content.logo' )
				view.get( 'controller.controllers.lightbox' ).send( 'show', pic )
			},
			keyPress: function ( evt ) {

			}
		}
	})


	BB.LightboxView = Ember.View.extend({
		classNames: [ 'lightbox' ],
		classNameBindings: [ 'visible' ],
		attributeBindings: [ 'style' ],

		style: function () {
			var url = this.get( 'controller.picture.url' )
			return url ? 'background-image:url('+url+')' : ''
		}.property( 'controller.picture' ),

		visible: function () {
			var picture = this.get( 'controller.picture' )
			return this.inDOM && !!picture ? 'visible' : ''
		}.property( 'controller.picture' ),

		didInsertElement: function () {
			this.set( 'inDOM', true )
		},

		eventManager: {
			click: function ( event, view ) {
				view.get( 'controller' ).send( 'hide' )
			},
			keyPress: function ( event, view ) {
				view.get( 'controller' ).send( 'hide' )
			}
		}

	})


	BB.XhrprogressView = Ember.View.extend({
		classNames: [ 'xhrprogress' ],

		uploadsCompleted: function () {
			if ( this.get( '_state' ) !== 'inDOM' ) return
			if ( this.get( 'controller.content.length' ) > 0 )
				this.$().fadeIn( 600 )
			else
				this.$().fadeOut( 200 )
		}.observes( 'controller.content.length' )

	})


})
