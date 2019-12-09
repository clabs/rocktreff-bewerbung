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
	'vendor/howler/dist/howler'

], function ( BB, HowlerJS ) {

	'use strict';

	var Howler = HowlerJS.Howler
	var Howl = HowlerJS.Howl
	var ID = 0


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
		player: null,

		_timer: null,
		startPlayerObserver: function () {
			var controller = this
			this._timer = setInterval( function () {
				var player = controller.get( 'player' )
				controller.setProperties({
					duration: player.duration(),
					position: player.seek()
				})
			}, 200)
		},
		stopPlayerObserver: function () {
			clearInterval( this._timer )
		},

		loadPlayer: function ( url ) {
			var controller = this
			var player = this.player = new Howl({
				src: [ url ],
				format: 'm4a',
				buffer: true,
				html5: true,
				volume: 1,
				rate: 1,
				autoplay: false,
				onload: function () {
					controller.set( 'isReady', true )
					controller.startPlayerObserver()
				},
				onunload: function () {
					controller.stopPlayerObserver()
				},
				onpaused: function () {
					controller.set( 'isPlaying', false )
					controller.stopPlayerObserver()
				},
				onplay: function () {
					controller.startPlayerObserver()
				},
				onend: function () {
					controller.set( 'isPlaying', false )
					controller.stopPlayerObserver()
				},
				onstop: function () {
					controller.set( 'isPlaying', false )
					controller.stopPlayerObserver()
				}
			})
			player.play()
			return player
		},

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
			var controller = this
			var player = this.get( 'player' )
			var url = media.get( 'url' )
			if ( player ) {
				player.pause()
				player.unload()
			}
			controller.set( 'content', media )
			controller.set( 'isReady', false )
			window.player = controller.loadPlayer( url )
		}.debounce( 200 ),

		actions: {
			playpause: function () {
				var player = this.get( 'player' )
				var playing = player.playing()
				if ( playing ) {
					player.pause()
				} else {
					player.play()
				}
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
