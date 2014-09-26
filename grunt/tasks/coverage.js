'use strict';

module.exports = function(grunt) {
    return function task() {
        require('child_process').exec('COVERAGE=1 mocha --require tests/index.js --recursive tests -R html-cov > tests/coverage.html');
    };
};
