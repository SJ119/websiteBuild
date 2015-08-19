module.exports = function(grunt) {

	require('load-grunt-tasks')(grunt, {
		pattern: ['grunt-contrib-*']
	});

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['gruntfile.js', 'src/**/*.js']
		},
		copy: {
			dist: {
				files: [{
					expand: true,
					cwd: 'dist/',
					src: ['**/*'],
					dest: '../websiteDist/'
				}]
			},
			lib: {
				files: [{
					expand: true,
					cwd: 'bower_components/',
					src: ['angular/angular*.js', 'angular-animate/angular-animate*.js', 'd3/d3*.js', 'd3-tip/index.js', 'jQuery/dist/jquery*.js', 'bootstrap/dist/css/bootstrap.min.css', 'normalize.css/normalize.css'],
					dest: 'dist/lib/'
				}]
			},
			html: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: ['index.html', 'html/*'],
					dest: 'dist/'
				}]
			},
			assets: {
				files: [{
					expand: true,
					src: ['assets/**/*'],
					dest: 'dist/'
				}]
			},
			readme: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: 'README.md',
					dest: 'dist/'
				}]
			}
		},
		clean: ['build/', 'dist/'],
		concat: {
			distJS: {
				src: ['src/**/*.js', '!src/scatter-plot/*.js'],
				dest: 'dist/js/<%= pkg.name %>.js'
			},
			distLESS: {
				src: ['src/**/*.less'],
				dest: 'build/less/<%= pkg.name %>.less'
			}
		},
		less: {
			development: {
				files: {
					'dist/css/<%= pkg.name %>.css': '<%= concat.distLESS.dest %>'
				}
			}
		},
		cssmin: {
			target: {
				files: {
					'dist/css/<%= pkg.name %>.min.css': 'dist/css/<%= pkg.name %>.css'
				}
			}
		},
		uglify: {
			distJS: {
				files: {
					'dist/js/<%= pkg.name %>.min.js': ['<%= concat.distJS.dest %>']
				}
			}
		},
		connect: {
			server: {
				options: {
					port: 8000,
					base: './dist',
				}
			}
		},
		watch: {
			files: ['<%= jshint.files %>', 'src/**/*.less', 'src/**/*.html'],
			tasks: ['jshint', 'concat', 'less', 'cssmin', 'uglify', 'copySrc'],
			options: {
				livereload: true
			}
		}
	});

	grunt.registerTask('copySrc', ['copy:lib', 'copy:html', 'copy:assets', 'copy:readme']);
	grunt.registerTask('export', ['copy:dist']);
	grunt.registerTask('gallery', ['connect', 'watch']);
	grunt.registerTask('default', ['jshint', 'concat', 'less', 'cssmin', 'uglify', 'copySrc']);

};