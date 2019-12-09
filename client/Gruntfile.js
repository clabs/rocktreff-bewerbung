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
;(function ( undefined ) {

'use strict';


module.exports = function( grunt ) {

	// load all grunt tasks
	require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks )

	var path = require( 'path' )
	var livereload = require( 'grunt-contrib-livereload/lib/utils' ).livereloadSnippet
	var mount = function ( dir ) {
		var serve = require( 'serve-static' )
		var path = require( 'path' ).resolve( dir )
		return serve( path )
	}

	//
	// Grunt configuration:
	//
	// https://github.com/cowboy/grunt/blob/master/docs/getting_started.md
	//
	grunt.initConfig({


		// configurable paths
		bb: {
			client: 'app',
			dist: 'dist',
			release: '<%=bb.dist %>/release-' + ( +(new Date()) ),
			requirejs: '<%= bb.dist %>/.require_tmp',
			tmp: '.tmp',
			port: 4711
		},

		less: {
			server: {
				files: [
					{ src: '<%= bb.client %>/styles/main.less', dest: '.tmp/styles/main.css' }
				]
			},
			release: {
				files: [
					{ src: '<%= bb.client %>/styles/main.less', dest: '<%= bb.release %>/styles/main.css' }
				]
			}
		},

		// compile handlebars templates
		handlebars: {
			server: {
				files: {
					'<%= bb.tmp %>/js/templates.js': [ '<%= bb.client %>/templates/{,*/}*.hbs' ]
				}
			},
			release: {
				files: {
					'<%= bb.client %>/js/templates.js': [ '<%= bb.client %>/templates/{,*/}*.hbs' ]
				}
			}
		},

		livereload: {
			port: 35728
		},

		watch: {
			server: {
				files: [
					'<%= bb.client %>/*.html',
					'{<%= bb.tmp %>,<%= bb.client %>}/js/**/*.js',
					'{.tmp,<%= bb.client %>}/styles/**/*.css',
					'!{<%= bb.tmp %>,<%= bb.client %>}/js/vendor/**/*.js',
					'<%= bb.client %>/images/**/*.{png,jpg,jpeg,gif,webp}'
				],
				tasks: [ 'livereload' ]
			},
			less: {
				files: [ '<%= bb.client %>/styles/{,*/}*.{scss,less}' ],
				tasks: [ 'less:server' ]
			},
			handlebars: {
				files: [ '<%= bb.client %>/templates/**/*.hbs' ],
				tasks: [ 'handlebars:server', 'livereload' ]
			}
		},

		connect: {
			options: {
				port: '<%= bb.port %>',
				hostname: '0.0.0.0'
			},
			server: {
				options: {
					middleware: function () {
						return [
								livereload,
								mount( '.tmp' ),
								mount( 'app' )
							]
						}
				}
			},
			test: {
				options: {
					middleware: function () {
						return [
							mount( '.tmp' ),
							mount( 'test' )
						]
					}
				}
			},
			release: {
				options: {
					middleware: function () {
						return [
							mount( 'dist' )
						]
					}
				}
			}
		},

		open: {
			server: {
				path: 'http://localhost:<%= connect.options.port %>'
			}
		},

		clean: {
			dist: [ '.tmp', '<%= bb.dist %>/*', '!<%= bb.dist %>/release-*' ],
			release: [ '<%= bb.release %>' ],
			requirejs: [ '<%= bb.requirejs %>' ],
			templates: [ '<%= bb.client %>/templates.js' ],
			server: '.tmp'
		},

		replace: {
			requirejs: {
				src: '<%= bb.release %>/index.html',
				overwrite: true,
				replacements: [{
					from: '<script src="js/vendor/requirejs/require.js" data-main="js/main"></script>',
					to: '<script src="./require.js" data-main="main"></script>'
				}]
			}
		},

		jshint: {
			options: {
				jshintrc: '../.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'<%= bb.client %>/js/**/*.js',
				'<%= bb.client %>/js/vendor/*.js',
				'test/spec/{,*/}*.js'
			],
			core: [
				'<%= bb.client %>/js/**/*.js',
				'!<%= bb.client %>/js/vendor/**/*.js',
			]
		},

		requirejs: {
			release: {
				// Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
				options: {
					appDir: './app/',
					baseUrl: './js',
					dir: '<%= bb.requirejs %>',
					removeCombined: true,
					optimize: 'uglify',
					normalizeDirDefines: 'all',
					cssImportIgnore: null,
					inlineText: true,
					useStrict: false,
					skipModuleInsertion: false,
					optimizeAllPluginResources: false,
					logLevel: 9,
					preserveLicenseComments: true,
					findNestedDependencies: true,
					modules: [{
						name: 'main'
					}],
					paths: {
						jquery:'vendor/jquery/dist/jquery',
						handlebars:'vendor/handlebars/handlebars',
						ember: 'vendor/ember/ember',
						data: 'vendor/ember-data/ember-data',
						bootstrap: 'vendor/bootstrap/dist/js/bootstrap',
						moment: 'vendor/moment/min/moment-with-langs.min',
						hammer: 'vendor/hammerjs/hammer.min'
					},
					shim: {
						ember: { deps:[ 'jquery', 'handlebars' ], exports: 'Ember' },
						data: { deps:[ 'ember' ] },
						bootstrap: { deps: [ 'jquery' ] }
					},
				}
			}
		},

		imagemin: {
			release: {
				files: [{
					expand: true,
					cwd: '<%= bb.client %>/images',
					src: '{,*/}*.{png,jpg,jpeg}',
					dest: '<%= bb.release %>/images'
				}]
			}
		},


		copy: {
			release: {
				files: [
					// copy index.html
					{ expand: true, cwd: '<%= bb.client %>', src: 'index.html', dest: '<%= bb.release %>' },
					// copy favicon
					{ expand: true, cwd: '<%= bb.client %>', src: 'favicon.ico', dest: '<%= bb.release %>' },
					// copy htaccess
					{ expand: true, cwd: '<%= bb.client %>', src: '.htaccess', dest: '<%= bb.release %>' },
					// copy fonts
					{ expand: true, cwd: '<%= bb.client %>', flatten: true, src: 'fonts/**', dest: '<%= bb.release %>/fonts' },
					// copy swf
					{ expand: true, cwd: '<%= bb.client %>', flatten: true, src: 'swf/**', dest: '<%= bb.release %>/swf' }
				]
			},
			requirejs: {
				files: [
					{ expand: true, cwd: '<%= bb.requirejs %>', flatten: true, src: 'js/main.js', dest: '<%= bb.release %>' },
					{ expand: true, cwd: '<%= bb.requirejs %>', flatten: true, src: 'js/vendor/requirejs/require.js', dest: '<%= bb.release %>' }
				]
			}
		}

	})



	/**
	 * A simple multitask to pack handlebars source files
	 * into one javascript file.
	 *
	 * @author Robert Pagel
	 */
	grunt.registerMultiTask( 'handlebars', 'Pack Ember Handlebars templates.', function () {
		this.files.forEach( function ( file ) {
			var compiled = [ ]
			var output = ''
			file.src.forEach( function ( src ) {
				grunt.file.expand( src ).forEach( function ( filepath ) {
					var filename = filepath
						.replace( /^app\/templates\/(.*?).hbs$/, '$1' )
					var src = grunt.file.read( filepath )
								.replace( /\n|\n\r|\r\n/g , '\\n' )
								.replace( /'/g, '\\\'' )
					compiled.push( 't[\''+ filename +'\']=c(\''+ src +'\' );' )
				})
			})
			output = 'define([\'ember\'],function(e){ \'use strict\';\n'+
					 'var t=e.TEMPLATES,h=e.Handlebars,c=h.compile.bind(h);\n' +
					 compiled.join( '\n' )+'\n})'
			grunt.file.write( file.dest, output )
			grunt.log.write( '\u001b[32mcreated\u001b[39m ' + file.dest + '\n' )
		})
	})

	grunt.renameTask( 'regarde', 'watch' )


	grunt.registerTask( 'server', [
		'clean:server',
		'less:server',
		'handlebars:server',
		'livereload-start',
		'connect:server',
		'open:server',
		'watch'
	])


	grunt.registerTask( 'build', [
		//'jshint:core',
		'clean:dist',
		'clean:release',
		'handlebars:release',
		'requirejs',
		'copy:release',
		'copy:requirejs',
		'clean:templates',
		'less:release',
		'imagemin',
		'replace:requirejs',
		'clean:requirejs'
	])

	grunt.registerTask( 'default', [
		'build'
	])

}

}())
