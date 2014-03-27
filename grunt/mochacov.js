'use strict';

module.exports = function(grunt) {
    return {
        coverage: {
            src: ['test/**/*.js'],
            options: {
                reporter: 'html-cov',
                output: 'test/coverage.html',
                timeout: '5000'
            }
        },
        test: {
            src: ['test/**/*.js'],
                options: {
                reporter: 'spec',
                timeout: '5000'
            }
        }
    };
};
