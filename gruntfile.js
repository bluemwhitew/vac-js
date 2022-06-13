'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            target: 'vac.js'
        },
        uglify: {
            options: {
                compress: true,
                mangle: true
            },
            default: {
                files: {
                    'vac.min.js': ['vac.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-eslint');

    grunt.registerTask('build', ['uglify']);
    grunt.registerTask('lint', ['eslint']);
    grunt.registerTask('default', ['lint', 'build']);
};
