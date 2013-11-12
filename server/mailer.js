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


var nodemailer = require( 'nodemailer' )
var Promise = require( 'promise' )

exports = module.exports = function ( app ) {

	var smtpTransport = nodemailer.createTransport( 'SMTP', {
		host: app.get( 'email-host' ),
		port: app.get( 'email-port' ),
		secureConnection: app.get( 'email-usetls' ),
		auth: {
			user: app.get( 'email-user' ),
			pass: app.get( 'email-pass' )
		}
	})

	var send = function ( to, subject, text ) {
		var mailOptions = {
			from: app.get( 'email-from' ),
			to: to,
			subject: subject,
			text: text
		}
		return new Promise( function ( fulfill, reject ) {
			smtpTransport.sendMail( mailOptions, function ( err, res ) {
				if ( err ) reject( err )
				else fulfill( res )
			})
		})
	}

	var greetings = function ( user ) {
		var subject = 'ROCKTREFF 2014 - Deine Anmeldung'
		var text = 'Vielen Dank für Eure Anmeldung!\n\n' +
		           'Bis zum 28.2.2014 habt Ihr Zeit Eure Bewerbung zu bearbeiten.' +
		           'Dazu einfach wieder auf die Bewerbungsseite gehen und anmelden.\n\n' +
		           'http://www.rocktreff.de/bewerben\n\n' +
		           'Anfang März 2014 machen wir die Auswahl und melden uns kurz darauf bei Euch.\n\n' +
		           'Gruß Euer ROCKTREFF-Team'
		return send( user.email, subject, text )
	}

	app.set( 'mailer', {
		send: send,
		greetings: greetings
	})

}
