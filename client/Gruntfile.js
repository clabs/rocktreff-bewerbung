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
	var mount = function ( connect, dir ) {
		return connect.static( path.resolve( dir ) )
	}

	//
	// Grunt configuration:
	//
	// https://github.com/cowboy/grunt/blob/master/docs/getting_started.md
	//
	grunt.initConfig({


		// configurable paths
		bb: {
			client: '.',
			dist: '../dist/client',
			tmp: '../.tmp',
			port: 1337
		},

		less: {
			'<%= bb.tmp %>/styles/main.css': '<%= bb.client %>/styles/{,*/}*.{scss,less}'
		},

		// compile handlebars templates
		handlebars: {
			dev: {
				files: {
					'<%= bb.tmp %>/js/templates.js': [ '<%= bb.client %>/templates/**/*.hbs' ]
				}
			}
		},

		livereload: {
			port: 35728
		},

		watch: {
			client: {
				files: [
					'<%= bb.client %>/*.html',
					'{<%= bb.tmp %>,<%= bb.client %>}/js/**/*.js',
					'!{<%= bb.tmp %>,<%= bb.client %>}/js/vendor/**/*.js',
					'<%= bb.client %>/images/**/*.{png,jpg,jpeg,gif,webp}'
				],
				tasks: [ 'livereload' ]
			},
			less: {
				files: [ '<%= bb.client %>/styles/{,*/}*.{scss,less}' ],
				tasks: [ 'less' ]
			},
			handlebars: {
				files: [ '<%= bb.client %>/templates/**/*.hbs' ],
				tasks: [ 'handlebars' ]
			}
		},

		connect: {
			options: {
				port: '<%= bb.port %>',
				hostname: '0.0.0.0'
			},
			dev: {
				options: {
					middleware: function ( connect ) {
						return [
								livereload,
								mount( connect, '../.tmp' ),
								mount( connect, '.' )
							]
						}
				}
			},
			test: {
				options: {
					middleware: function ( connect ) {
						return [
							mount( connect, '../.tmp' ),
							mount( connect, 'test' )
						]
					}
				}
			},
			dist: {
				options: {
					middleware: function ( connect ) {
						return [
							mount( connect, 'dist' )
						]
					}
				}
			}
		},

		open: {
			frontend: {
				path: 'http://localhost:<%= connect.options.port %>'
			}
		},

		clean: {
			options: { force: true },
			dist: [ '<%= bb.tmp %>', '<%= bb.dist %>/*' ],
			frontend: '<%= bb.tmp %>'
		},

		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'<%= bb.client %>/js/**/*.js',
				'<%= bb.client %>/js/vendor/*.js',
				'test/spec/{,*/}*.js'
			],
			core: [
				'<%= bb.client %>/js/**/*.js',
				'!<%= bb.client %>/js/vendor/*.js',
			]
		},

		mocha: {
			all: {
				options: {
					run: true,
					urls: ['http://localhost:<%= connect.options.port %>/index.html']
				}
			}
		},

		requirejs: {
			dist: {
				options: {
					baseUrl: './js',
					preserveLicenseComments: true,
					useStrict: true,
					wrap: true,
					dir: '<%= bb.dist %>/js',
					optimize: 'uglify2',
					// use almond in production
					// https://github.com/asciidisco/grunt-requirejs/blob/master/docs/almondIntegration.md
					almond: true
				}
			}
		},

		useminPrepare: {
			html: '<%= bb.client %>/index.html',
			options: {
				dest: '<%= bb.dist %>'
			}
		},

		usemin: {
			html: ['<%= bb.dist %>/{,*/}*.html'],
			css: ['<%= bb.dist %>/styles/{,*/}*.css'],
			options: {
				dirs: ['<%= bb.dist %>']
			}
		},

		cssmin: {
			dist: {
				files: {
					'<%= bb.dist %>/styles/main.css': [
						'<%= bb.tmp %>/styles/{,*/}*.css',
						'<%= bb.client %>/styles/{,*/}*.css'
					]
				}
			}
		},

		htmlmin: {
			dist: {
				options: {
					/*removeCommentsFromCDATA: true,
					// https://github.com/yeoman/grunt-usemin/issues/44
					//collapseWhitespace: true,
					collapseBooleanAttributes: true,
					removeAttributeQuotes: true,
					removeRedundantAttributes: true,
					useShortDoctype: true,
					removeEmptyAttributes: true,
					removeOptionalTags: true*/
					force: true
				},
				files: [{
					expand: true,
					cwd: '<%= bb.client %>',
					src: '*.html',
					dest: '<%= bb.dist %>'
				}]
			}
		},

		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= bb.client %>',
					dest: '<%= bb.dist %>',
					src: [
						'*.{ico,txt}',
						'.htaccess'
					]
				}]
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
						.replace( /^\.\/templates\/(.*?).hbs$/, '$1' )
					var src = grunt.file.read( filepath )
								.replace( /\n|\n\r|\r\n/g , '\\n' )
								.replace( /'/g, '\\\'' )
					compiled.push( 'Ember.TEMPLATES[\''+ filename +'\']=Ember.Handlebars.compile(\''+ src +'\' );' )
				})
			})
			output = 'define(["ember"],function(Ember){\n'+compiled.join( '\n' )+'\n})'
			grunt.file.write( file.dest, output )
			grunt.log.write( '\u001b[32mcreated\u001b[39m ' + file.dest + '\n' )
		})
	})

	grunt.renameTask( 'regarde', 'watch' )


	grunt.registerTask( 'server', [
		'clean:frontend',
		'less',
		'handlebars',
		'livereload-start',
		'connect:dev',
		'open:frontend',
		'watch'
	])


	grunt.registerTask( 'test', [
		'clean:dev',
		'less',
		'handlebars',
		'connect:test',
		'mocha'
	])

	grunt.registerTask( 'build', [
		'clean:dist',
		'less:dist',
		'handlebars',
		'useminPrepare',
		'requirejs',
		'htmlmin',
		'concat',
		'cssmin',
		'uglify',
		'copy',
		'usemin'
	])

	grunt.registerTask( 'default', [
		'jshint',
		'test',
		'build'
	])

}

}())
