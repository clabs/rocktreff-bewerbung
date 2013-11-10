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
	'audio5js'

], function ( BB, audio5js ) {

	'use strict';


	BB.AudioplayerView = Ember.View.extend({

		templateName: 'audioplayer_controls',

		didInsertElement: function () {
			var self = this
			var controller = this.get( 'controller' )

			//init wavesurfer if neeeded
			if ( controller.get( 'useWaveSurfer' ) ) {
				controller.get( 'player' ).init({
					container: this.$().find( '.waveform' )[0],
					height: 30,
					minPxPerSec: 0.5,
					normalize: true,
					progressColor: '#ffef03'
				})
			}

			this.$().find( '.audioplayer-playpause' )
				.on( 'click', function ( evt ) {
					controller.send( 'playpause' )
				})
			this.$().find( '.audioplayer-stop' )
				.on( 'click', function ( evt ) {
					controller.send( 'stop' )
				})
		}

	})


})
