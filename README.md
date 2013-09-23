# Introduction
This software aims to simplify to process selecting bands for the ROCKTREFF event. Therefore, the workflow is quite opinionated. You may fork the project and put your hands on to make it fit your requirements.

 [![Build Status](https://travis-ci.org/clabs/rocktreff-bewerbung.png?branch=master)](https://travis-ci.org/clabs/rocktreff-bewerbung)



##  Setup
The project is split into two subprojects that have there own dependencies and build scripts. For the client go to the `client/` directory (you may guessed it) and run `npm install && bower install`. That will download all Grunt related dependencies and the ones for the browser like jQuery, Bootstrap, … . For a preview as well as for developing hit `grunt server`.

The server needs to be started before the client webapp starts. Go to the `server/` directory, install all dependencies via `npm install` and start the server with 'npm start'.

## Testing
The server can be tested via `npm test`. In cases you want so debug the server in test mode you may launch the server in another shell with `NODE_ENV=test node --debug server.js`. Than run the mocha specs with `make test`.


# API
See the [REST API](https://github.com/clabs/rocktreff-bewerbung/api.md) documentation.
