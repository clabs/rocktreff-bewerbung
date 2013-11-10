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

	BB.User = RL.Model.extend({

		bandname: RL.attr( 'string' ),
		email: RL.attr( 'string' ),
		provider: RL.attr( 'string' ),
		role: RL.attr( 'string' ),
		picture: RL.attr( 'string', { readOnly: true } ),

		isMe: function () {
			return this.get( 'id' ) === BB.get( 'user.id' )
		}.property( 'BB.user.id' ),

		isAdmin: function () {
			return this.get( 'role' ) === 'admin'
		}.property( 'role' ),

		isCrew: function () {
			return this.get( 'role' ) === 'crew'
		}.property( 'role' ),

		isNeither: function () {
			return this.get( 'role' ) === ''
		}.property( 'role' )

	})


	BB.Event = RL.Model.extend({
		name: RL.attr( 'string' ),
		opening_date: RL.attr( 'isodate', { defaultValue: new Date() } ),
		closing_date: RL.attr( 'isodate' )
	})


	BB.Media = RL.Model.extend({
		bid: RL.attr( 'string' ),
		type: RL.attr( 'string' ),
		url: RL.attr( 'string' ),
		attributes: RL.attr( 'object' ),
		mimetype: RL.attr( 'string' ),
		filename: RL.attr( 'string' ),
		filesize: RL.attr( 'number' ),
		data: RL.attr( 'string' )
	})


	BB.Vote = RL.Model.extend({
		user: RL.attr( 'string' ),
		bid: RL.attr( 'string' ),
		rating: RL.attr( 'number' )
	})


	BB.Note = RL.Model.extend({
		user: RL.attr( 'string' ),
		bid: RL.attr( 'string' ),
		type: RL.attr( 'string' ),
		text: RL.attr( 'string' )
	})


	BB.Bid = RL.Model.extend({
		user: RL.attr( 'string' ),
		event: RL.attr( 'string' ),
		region: RL.attr( 'string' ),
		bandname: RL.attr( 'string' ),
		style: RL.attr( 'string' ),
		student: RL.attr( 'string' ),
		managed: RL.attr( 'boolean' ),
		letter: RL.attr( 'string' ),
		contact: RL.attr( 'string' ),
		phone: RL.attr( 'string' ),
		mail: RL.attr( 'string' ),
		url: RL.attr( 'string' ),
		fb: RL.attr( 'string' ),
		media: RL.hasMany( 'BB.Media', { readOnly: true } ),
		votes: RL.hasMany( 'BB.Vote', { readOnly: true } ),
		notes: RL.hasMany( 'BB.Note', { readOnly: true } )
	})


	BB.RESTAdapter.configure( 'plurals', {
		media: 'media'
	})



})