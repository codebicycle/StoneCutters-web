'use strict';

module.exports = function(grunt) {
    return function task() {
        require('child_process').exec('mocha --require tests/index.js --require tests/blanket.js --recursive tests -R html-cov > tests/coverage.html');
    };
};
