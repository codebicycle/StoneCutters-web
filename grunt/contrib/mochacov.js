'use strict';

module.exports = function(grunt) {
    return {
        unit: {
            src: ['test/unit/**/*.js', '!test/unit/app/controllers/categories.js'],
                options: {
                reporter: 'spec',
                timeout: '15000'
            }
        },
        coverage: {
            src: ['test/unit/**/*.js', '!test/unit/app/controllers/categories.js'],
            options: {
                reporter: 'html-cov',
                output: 'test/unit/coverage.html',
                timeout: '15000'
            }
        },
        acceptance: {
            //src: ['test/acceptance/**/*.js', '!test/acceptance/zombie.js'],
            src: [],
            options: {
                reporter: 'spec',
                timeout: '15000'
            }
        }
    };
};
