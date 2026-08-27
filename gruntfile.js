'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
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

    grunt.registerTask('build', ['uglify']);
    grunt.registerTask('default', ['build']);
};
