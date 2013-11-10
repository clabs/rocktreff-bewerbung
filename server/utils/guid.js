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
'use strict';

var bases = require( 'bases' )
var crypto = require( 'crypto' )

// Returns a base-62 (alphanumeric only) string
// based on https://gist.github.com/aseemk/3095925
module.exports = function ( length ) {
	// We generate a random number in a space at least as big as 62^length,
	// and if it's too big, we just retry. This is still statistically O(1)
	// since repeated probabilities less than one converge to zero. Hat-tip to
	// a Google interview for teaching me this technique! ;)
	// The native randomBytes() returns an array of bytes, each of which is
	// effectively a base-256 integer. We derive the number of bytes to
	// generate based on that, but note that it can overflow after ~150:
	length = length || 8
	var maxNum = Math.pow( 62, length )
	var numBytes = Math.ceil( Math.log( maxNum ) / Math.log( 256 ) )
	var bytes, num, i
	do {
		bytes = crypto.randomBytes( numBytes )
		num = 0
		for ( i = 0; i < bytes.length; i += 1)
			num += Math.pow( 256, i ) * bytes[ i ]
	} while ( num >= maxNum )
	return bases.toBase62( num )
}
