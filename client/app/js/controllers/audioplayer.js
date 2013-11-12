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
	'wavesurfer'

], function ( BB, Audio5js, WaveSurfer ) {

	'use strict';



	BB.AudioplayerController = Ember.ObjectController.extend({

		content: null,
		isReady: false,
		isPlaying: false,

		useWaveSurfer: false /*function () {
			var a = document.createElement( 'audio' )
			return !!( a.canPlayType && a.canPlayType( 'audio/mpeg;' ).replace( /no/, '' ) )
		}.property()*/,

		player: function () {
			var controller = this
			var useWaveSurfer = this.get( 'useWaveSurfer' )
			if ( useWaveSurfer ) {
				var wavesurfer = Object.create( WaveSurfer )
				wavesurfer.on( 'ready', function () {
					controller.set( 'isReady', true )
					wavesurfer.play()
				})
				return wavesurfer
			}
			else {
				return new Audio5js({
					swf_path: './swf/audio5js.swf',
					throw_errors: true,
					ready: function ( player ) {
						var player = this
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
			}
		}.property(),

		duration: '00:00',
		position: '00:00',


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
				var playing = player.playing // || !(player.backend && player.backend.paused )
				this.set( 'playing', playing )
			},
			stop: function () {
				var player = this.get( 'player' )
				player.pause()
				player.seekTo && player.seekTo( 0 ) || player.seek( 0 )
			}
		}

	})
})
