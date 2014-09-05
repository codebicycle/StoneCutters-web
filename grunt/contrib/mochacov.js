'use strict';

module.exports = function(grunt) {
    return {
        unit: {
            src: ['tests/**/*.js', '!tests/app/controllers/categories.js', '!tests/app/controllers/items.js'],
                options: {
                reporter: 'spec',
                timeout: '15000'
            }
        },
        coverage: {
            src: ['tests/**/*.js', '!tests/app/controllers/categories.js', '!tests/app/controllers/items.js'],
            options: {
                reporter: 'html-cov',
                output: 'tests/coverage.html',
                timeout: '15000'
            }
        },
        tdd: {
            src: ['tests2/index.js', 'tests2/**/*.test.js'],
            options: {
                globals: ['expect', 'sinon'],
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'spec'
            }
        }
    };
};
