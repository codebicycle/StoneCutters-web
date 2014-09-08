'use strict';

module.exports = function(grunt) {
    return {
        unit: {
            src: ['tests/**/*.test.js'],
            options: {
                require: 'tests/index.js',
                globals: ['expect', 'sinon'],
                ignoreLeaks: false,
                reporter: grunt.option('reporter') || 'nyan'
            }
        }
    };
};
