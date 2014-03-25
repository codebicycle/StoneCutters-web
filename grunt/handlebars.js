'use strict';

module.exports = function(grunt) {
    return {
        compile: {
            options: {
                namespace: false,
                commonjs: true,
                processName: function(filename) {
                    return filename.replace('app/templates/', '').replace('.hbs', '');
                }
            },
            src: 'app/templates/**/*.hbs',
            dest: 'app/templates/compiledTemplates.js',
            filter: function(filename) {
                filename = require('path').basename(filename);
                return filename.slice(0, 2) !== '__';
            }
        }
    };
};
