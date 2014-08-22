'use strict';

module.exports = function(grunt) {
    return {
        strict: {
            src: ['public/css/**/*.css']
        },
        lax: {
            options: {
                csslintrc: '.csslintrc'
            },
            src: ['public/css/**/*.css']
        }
    };

};
