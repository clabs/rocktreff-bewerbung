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
			name: { type: 'string', required: true },
			email: { type: 'string', required: true, pattern: /^[\w.+-]+@[\w\d.-]+\.[\w\d.-]+$/ },
			password: { type: 'string' },
			created: { type: 'string' },
			provider: { type: 'string', required: true },
			role: { type: 'string', required: true }
		}
	}

}
