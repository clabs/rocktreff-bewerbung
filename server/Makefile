REPORTER = spec
UI = bdd

test:
	@git checkout -- .db/test
	@./node_modules/.bin/mocha \
		--ui $(UI) \
		--reporter $(REPORTER) \
		--bail
	@git checkout -- .db/test

.PHONY: test
