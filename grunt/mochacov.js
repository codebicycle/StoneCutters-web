'use strict';

module.exports = function(grunt) {
    return {
        unit: {
            src: ['test/unit/**/*.js'],
                options: {
                reporter: 'spec',
                timeout: '5000'
            }
        },
        coverage: {
            src: ['test/unit/**/*.js'],
            options: {
                reporter: 'html-cov',
                output: 'test/unit/coverage.html',
                timeout: '5000'
            }
        },
        acceptance: {
            src: ['test/acceptance/**/*.js', '!test/acceptance/zombie.js'],
                options: {
                reporter: 'spec',
                timeout: '5000'
            }
        }
    };
};
