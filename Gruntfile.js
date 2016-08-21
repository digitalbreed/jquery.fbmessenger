module.exports = function(grunt) {

	grunt.initConfig({
		sass: {
			options: {
				sourceMap: true,
				outputStyle: 'compressed'
			},
			dist: {
				files: {
					'dist/jquery.fbmessenger.css': 'src/sass/jquery.fbmessenger.scss'
				}
			}
		},
		uglify: {
			options: {
				separator: ';',
				preserveComments: function(node, comment) {
					// custom function because 'some' didn't work for me
					return /^!/.test(comment.value);
				}
			},
			my_target: {
				files: {
					'dist/jquery.fbmessenger.min.js': [
						'src/js/**/*.js'
					]
				}
			}
		},
		watch: {
			sass: {
				files: [ 'src/**/*.scss' ],
				tasks: [ 'sass' ]
			},
			uglify: {
				files: [ 'src/**/*.js' ],
				tasks: [ 'uglify' ]
			}
		}
	});

	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', [ 'watch' ]);

};
