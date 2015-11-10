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

// based on http://tools.ietf.org/html/draft-zyp-json-schema-03
exports = module.exports = {

	user: {
		id: '/User',
		properties: {
			id: { type: 'string' },
			created: { type: 'string', format: 'date-time' },
			modified: { type: 'string', format: 'date-time' },
			name: { type: 'string' },
			email: { type: 'string', required: true, format: 'email' },
			password: { type: 'string' },
			provider: { type: 'string', required: true },
			role: { type: 'string', required: true }
		}
	},

	bid: {
		id: '/Bid',
		properties: {
			id: { type: 'string' },
			created: { type: 'string', format: 'date-time' },
			modified: { type: 'string', format: 'date-time' },
			event: { type: 'string', required: true },
			category: { type: 'string' },
			region: { type: 'string' },
			bandname: { type: 'string' },
			student: { type: 'boolean' },
			managed: { type: 'boolean' },
			style: { type: 'string' },
			letter: { type: 'string' },
			contact: { type: 'string' },
			phone: { type: 'string' },
			mail: { type: 'string', required: true, format: 'email' },
			url: { type: 'string' },
			fb: { type: 'string' },
			media: { type: 'array', items: { type: 'string' } },
			// non "public" properties
			votes: { type: 'array', items: { type: 'string' } },
			notes: { type: 'array', items: { type: 'string' } }
		}
	},

	media: {
		id: '/Media',
		properties: {
			id: { type: 'string' },
			created: { type: 'string', format: 'date-time' },
			modified: { type: 'string', format: 'date-time' },
			bid: { type: 'string', required: true },
			type: { type: 'string', required: true, pattern: /^youtube|audio|picture|logo|document$/ },
			url: { type: 'string', format: 'uri' },
			meta: { type: 'string' },
			mimetype: { type: 'string' },
			filename: { type: 'string' },
			filesize: { type: 'number' },
		}
	},

	event: {
		id: '/Event',
		properties: {
			id: { type: 'string' },
			created: { type: 'string', format: 'date-time' },
			modified: { type: 'string', format: 'date-time' },
			name: { type: 'string', required: true },
			opening_date: { type: 'string', required: true, format: 'date-time' },
			closing_date: { type: 'string', required: true, format: 'date-time' },
			tracks: { type: 'array', items: { type: 'string' } }
		}
	},

	track: {
		id: '/Track',
		properties: {
			id: { type: 'string' },
			created: { type: 'string', format: 'date-time' },
			modified: { type: 'string', format: 'date-time' },
			name: { type: 'string', required: true },
			event: { type: 'string', required: true },
			visible: { type: 'boolean', required: true }
		}
	},

	vote: {
		id: '/Vote',
		properties: {
			id: { type: 'string' },
			created: { type: 'string', format: 'date-time' },
			modified: { type: 'string', format: 'date-time' },
			user: { type: 'string', required: true },
			bid: { type: 'string', required: true },
			rating: { type: 'integer', required: true, minimum: 0, maximum: 5 }
		}

	},

	note: {
		id: '/Note',
		properties: {
			id: { type: 'string' },
			created: { type: 'string', format: 'date-time' },
			modified: { type: 'string', format: 'date-time' },
			user: { type: 'string', required: true },
			bid: { type: 'string', required: true },
			type: { type: 'string', required: true, pattern: /^(flag.?|memo)$/ },
			text: { type: 'string' }
		}
	},

	region: {
		id: '/Region',
		properties: {
			id: { type: 'string' },
			created: { type: 'string', format: 'date-time' },
			modified: { type: 'string', format: 'date-time' },
			name: { type: 'string', required: true }
		}
	}

}
