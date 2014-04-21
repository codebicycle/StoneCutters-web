'use strict';

module.exports = function(grunt) {
    return {
        anonymousFunctions: '! grep -e "[^:= ][ ]*function()" app/collections/** app/controllers/** app/helpers/** app/models/** app/templates/** app/views/**/** server/**/** app/**',
        removeTemplates: 'rm -rf app/templates/compiledTemplates.js',
        removeAssets: 'rm -rf public/js/app.js public/js/libs.js',
        removeStyles: 'rm -rf public/css'
    };
};
