'use strict';

module.exports = function(grunt) {
    return {
        anonymousFunctions: '! grep -e "[^:= ][ ]*function()" app/collections/** app/controllers/** app/helpers/** app/models/** app/templates/** app/views/**/** server/**/** app/**',
        removeTranslations: 'rm -rf app/translations public/js/src/translations.js public/js/min/translations.*',
        removeTemplates: 'rm -rf app/templates public/js/src/templates',
        removeAssets: 'rm -rf public/js/src public/js/min',
        removeStyles: 'rm -rf public/css',
        removeIcons: 'rm -rf public/images/**/icons',
        removeDist: 'rm -rf dist',
        removeDistGit: 'rm -rf dist/git',
        removeCoverage: 'rm -rf coverage',
        chmodDistStart: 'chmod 777 dist/start.sh'
    };
};
