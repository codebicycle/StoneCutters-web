'use strict';

module.exports = function(grunt) {
    return {
        unit: {
            src: ['tests/index.js', 'tests/**/*.test.js'],
            options: {
                globals: ['expect', 'sinon'],
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'spec'
            }
        },
        coverage: {
            src: ['tests/index.js', 'tests/**/*.test.js'],
            options: {
                globals: ['expect', 'sinon'],
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'html-cov',
                output: 'tests/coverage.html'
            }
        }
    };
};
