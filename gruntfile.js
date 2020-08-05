'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            target: 'vac.js'
        },
        jscs: {
            src: 'vac.js',
            options: {
                config: '.jscsrc'
            }
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
    grunt.loadNpmTasks('grunt-jscs');

    grunt.registerTask('build', ['uglify']);
    grunt.registerTask('lint', ['eslint', 'jscs']);
    grunt.registerTask('default', ['build']);
};
