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

var lrSnippet = require( 'grunt-contrib-livereload/lib/utils' ).livereloadSnippet
var mountFolder = function ( connect, dir ) {
	return connect.static( require( 'path' ).resolve( dir ) )
}

module.exports = function( grunt ) {

	// load all grunt tasks
	require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks )

	//
	// Grunt configuration:
	//
	// https://github.com/cowboy/grunt/blob/master/docs/getting_started.md
	//
	grunt.initConfig({

		// configurable paths
		bb: {
			client: 'client',
			dist: 'dist'
		},

		less: {
			'.tmp/styles/main.css': '<%= bb.client %>/styles/{,*/}*.{scss,less}'
		},

		// compile handlebars templates
		handlebars: {
			compile: {
				files: {
					'.tmp/js/templates/compiled.js': [ '<%= bb.client %>/js/templates/**/*.hbs' ]
				}
			},
			dist: {
				files: {
					'<%= bb.dist %>/js/templates/compiled.js': [ '<%= bb.client %>/js/templates/**/*.hbs' ]
				}
			}
		},

		watch: {
			less: {
				files: [ '<%= bb.client %>/styles/{,*/}*.{scss,less}' ],
				tasks: [ 'less' ]
			},
			livereload: {
				files: [
					'<%= bb.client %>/*.html',
					'{.tmp,<%= bb.client %>}/styles/**/*.css',
					'{.tmp,<%= bb.client %>}/js/**/*.js',
					'!{.tmp,<%= bb.client %>}/js/vendor/**/*.js',
					'<%= bb.client %>/images/**/*.{png,jpg,jpeg,webp}'
				],
				tasks: [ 'livereload' ]
			},
			handlebars: {
				files: [
					'<%= bb.client %>/js/**/*.hbs'
				],
				tasks: [ 'handlebars' ]
			}
		},

		connect: {
			options: {
				port: 1337,
				hostname: '0.0.0.0'
			},
			dev: {
				options: {
					middleware: function ( connect ) {
						return [
								lrSnippet,
								mountFolder( connect, '.tmp' ),
								mountFolder( connect, 'client' )
							]
						}
				}
			},
			test: {
				options: {
					middleware: function ( connect ) {
						return [
							mountFolder( connect, '.tmp' ),
							mountFolder( connect, 'test/<%= bb.client %>' )
						]
					}
				}
			},
			dist: {
				options: {
					middleware: function ( connect ) {
						return [
							mountFolder( connect, 'dist' )
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
			dist: [ '.tmp', '<%= bb.dist %>/*' ],
			dev: '.tmp'
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
					baseUrl: 'client/js',
					optimize: 'none',
					preserveLicenseComments: true,
					useStrict: true,
					wrap: true,
					dir: '<%= bb.dist %>/js'
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
						'.tmp/styles/{,*/}*.css',
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
					var filename = filepath.replace( /^client\/js\/templates\/(.*?).hbs$/, '$1' )
					var src = grunt.file.read( filepath )
								.replace( /\n|\n\r|\r\n/g , '\\n' )
								.replace( /'/g, '\\\'' )
					compiled.push( 'Ember.TEMPLATES[ \''+ filename +'\' ] = Ember.Handlebars.compile( \''+ src +'\' );' )
				})
			})
			output = 'define(["ember"],function(Ember){\n'+compiled.join( '\n' )+'\n})'
			grunt.file.write( file.dest, output )
			grunt.log.write( '\u001b[32mcreated\u001b[39m ' + file.dest + '\n' )
		})
	})





	grunt.renameTask( 'regarde', 'watch' )

	grunt.registerTask( 'dev', function ( target ) {
		if ( target === 'dist' )
			return grunt.task.run([
				'build',
				'open',
				'connect:dist:keepalive'
				])
		else
			return grunt.task.run([
				'clean:dev',
				'less',
				'handlebars',
				'livereload-start',
				'connect:dev',
				'open:frontend',
				'watch'
			])
	})

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
		'handlebars:dist',
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
