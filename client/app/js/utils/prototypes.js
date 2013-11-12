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


], function () {

	'use strict';

	Function.prototype.debounce = function ( wait, immediate ) {
		var f = this
		var timeout
		return function() {
			var context = this
			var args = Array.prototype.slice.call( arguments )
			var later = function () {
				timeout = null
				if ( !immediate ) f.apply( context, args )
			};
			var callNow = immediate && !timeout
			clearTimeout( timeout )
			timeout = setTimeout( later, wait )
			if ( callNow ) f.apply( context, args )
		}
	}

})
