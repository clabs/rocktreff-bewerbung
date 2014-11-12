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
	'audio5js',

], function ( BB, Audio5js ) {

	'use strict';


	function format ( time ) {
		var minutes = parseInt( time / 60, 10 )
		var seconds = parseInt( time % 60, 10 )
		minutes = minutes < 10 ? '0' + minutes : minutes
		seconds = seconds < 10 ? '0' + seconds : seconds
		return minutes + ':' + seconds
	}


	BB.AudioplayerController = Ember.ObjectController.extend({

		content: null,
		isReady: false,
		isPlaying: false,

		player: function () {
			var controller = this
			return new Audio5js({
				swf_path: './swf/audio5js.swf',
				throw_errors: true,
				format_time: false,
				ready: function ( player ) {
					player = this
					this.on( 'timeupdate', function ( position, duration ) {
						controller.setProperties({
							duration: duration,
							position: position
						})
					})
					player.on( 'canplay', function () {
						controller.set( 'isReady', true )
						player.play()
					})
				}
			})
		}.property(),

		duration: 1,
		position: 0,

		fposition: function () {
			return format( this.get( 'position' ) )
		}.property( 'position' ),

		fduration: function () {
			return format( this.get( 'duration' ) )
		}.property( 'duration' ),

		progress: function () {
			return this.get( 'position' ) / this.get( 'duration' ) * 100
		}.property( 'position', 'duration' ),


		load: function ( media ) {
			this.set( 'content', media )
			var player = this.get( 'player' )
			var url = media.get( 'url' )
			if ( player.playing ) player.pause()
			this.set( 'isReady', false )
			player.load( url )
		},

		actions: {
			playpause: function () {
				var player = this.get( 'player' )
				player.playPause()
				var playing = player.playing
				this.set( 'playing', playing )
			},
			stop: function () {
				var player = this.get( 'player' )
				player.pause()
				player.seek( 0 )
			},
			seek: function ( percent ) {
				var player = this.get( 'player' )
				var duration = this.get( 'duration' )
				player.seek( percent * duration )
			}
		}

	})
})
