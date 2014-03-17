'use strict';

module.exports = function(grunt) {
    return {
      coverage: {
        src: ['test/**/*.js'],
        options: {
          reporter: 'html-cov',
          output: 'test/coverage.html'
        }
      },
      test: {
        src: ['test/**/*.js'],
        options: {
          reporter: 'spec'
        }
      }
    };
};
