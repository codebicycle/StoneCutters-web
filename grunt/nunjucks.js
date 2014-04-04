'use strict';

module.exports = function(grunt) {
    return {
        precompile: {
            src: 'app/templates/**/*.html',
            dest: 'app/templates/compiledTemplates.js',
            filter: function(filename) {
                filename = require('path').basename(filename);
                return filename.slice(0, 2) !== '__';
            },
            options: {
                asFunction: true,
                name: function(filename) {
                    return filename.replace('app/templates/', '').replace('.html', '');
                }
            }
        }
    };
};
