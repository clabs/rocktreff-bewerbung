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

	var smtpTransport = nodemailer.createTransport({
		host: app.get( 'email-host' ),
		port: app.get( 'email-port' ),
		secure: app.get( 'email-usetls' ),
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
		console.log( mailOptions )
		return new Promise( function ( fulfill, reject ) {
			smtpTransport.sendMail( mailOptions, function ( err, res ) {
				console.log(err)
				if ( err ) reject( err )
				else fulfill( res )
			})
		})
	}

	var greetings = function ( bid ) {
		var subject = 'ROCKTREFF 2017 - Deine Anmeldung'
		var text = 'Vielen Dank für Deine Anmeldung!\n\n' +
		           'Bis zum 28.2.2017 habt Ihr Zeit Eure Bewerbung zu bearbeiten.\n\n' +
		           'http://www.rocktreff.de/bewerben/#/bewerbung/'+ bid.id +'\n\n' +
		           'Anfang März 2017 machen wir die Auswahl und melden uns kurz darauf bei Euch.\n\n' +
		           'Gruß Euer ROCKTREFF-Team'
		return send( bid.mail, subject, text )
	}

	var welcome = function ( user ) {
		var subject = 'ROCKTREFF Bandbewerbung'
		var text = 'Herzlich willkommen im System! ' +
		           'Infos zur Freischaltung im System gibt es in der ROCKINI!\n\n' +
		           'Gruß Euer ROCKTREFF-Team'
		return send( user.email, subject, text )
	}

	app.set( 'mailer', {
		send: send,
		greetings: greetings,
		welcome: welcome
	})

}
