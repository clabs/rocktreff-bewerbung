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

	BB.Router.map( function () {


		this.resource( 'bid', { path: '/bewerbung/:bid_id' } )
		this.resource( 'bids', { path: '/bewerbungen/:track_id' }, function () {
			this.resource( 'BidDetails', { path: '/:bid_id/details' } )
		})
		this.resource( 'unreviewed', { path: '/offen' } )
		this.resource( 'analysis', { path: '/auswertung' } )
		this.resource( 'export' )


		this.resource( 'NewBid', { path: '/bewerben' } )


		this.resource( 'users' )
		this.resource( 'user', { path: '/user/:id' }, function () {
			this.route( 'edit' )
		})

		this.resource( 'events', function () {
			this.resource( 'EventEdit', { path: '/:event_id/edit' } )
			this.route( 'new' )
		})


		this.resource( 'home' )
		this.resource( 'crew' )
		this.resource( 'login' )
		this.resource( 'signup' )
		this.resource( 'no' )
		this.resource( 'oops' )
	})
})
