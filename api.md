# Introduction
API Prefix `/v1`

# Endpoints and JSON Formats

## User

	{
		id: STRING,
		name: STRING,
		created: DATE,
		email: STRING,
		avatar_url: STRING,
		provider: STRING,
		rights: {
			godmode: BOOLEAN,
			ini: BOOLEAN,
			friend: BOOLEAN 
		},
		events: [ OBJECT ]
	}

	/me
	/users

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
		videos: [ OBJECT ],
		audios: [ OBJECT ],
		docs: [ OBJECT ]
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

