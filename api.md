# Introduction
API Prefix `/v1`

# Endpoints and JSON Formats

## User

	{
		id: STRING,
		name: STRING,
		created: DATE,
		email: STRING,
		provider: STRING,
		role: STRING
	}

	GET /me
	GET /users
	POST /users
	GET /user/:id
	POST /user/:id
	PUT /user/:id
	DELETE /user/:id

## Bids

	{
		id: STRING,
		bandname: STRING,
		created: DATE,
		last_modified: DATE,
		skill: STRING
		managed: BOOLEAN,
		letter: STRING,
		region: REGION,
		contact: {
			name: STRING,
			phone: STRING,
			mail: STRING,
			url: STRING,
			fb: STRIN
		}
		picture_small: STRING,
		picture: STRING,
		videos: [ STRING ],
		audios: [ STRING ],
		docs: [ STRING ]
	}

	/bids[?year]
	/bid/:id
	/bid/:id/votes

## Regions

	{
		id: STRING,
		name: STRING
	}

	/regions
	/region/:id

## Genres

	{
		id: STRING,
		name: STRING
	}

	/genres
	/genre/:id


## Event
	{
		id: STRING,
		name: STRING,
		bid_due_date: DATE
	}

	/events
	/event/:id

## Video, Audio and Docs
	{
		id: STRING,
		bid: STRING,
		url: STRING,
		created: DATE,
	}

	/video/:id
	/audio/:id
	/doc/:id

