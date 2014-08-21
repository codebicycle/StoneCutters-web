'use strict';

module.exports = function(grunt) {
    return {
        unit: {
            src: ['tests/**/*.js', '!tests/app/controllers/categories.js'],
                options: {
                reporter: 'spec',
                timeout: '15000'
            }
        },
        coverage: {
            src: ['tests/**/*.js', '!tests/app/controllers/categories.js'],
            options: {
                reporter: 'html-cov',
                output: 'tests/coverage.html',
                timeout: '15000'
            }
        }
    };
};
