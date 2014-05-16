'use strict';

module.exports = function(grunt) {
    return {
        anonymousFunctions: '! grep -e "[^:= ][ ]*function()" app/collections/** app/controllers/** app/helpers/** app/models/** app/templates/** app/views/**/** server/**/** app/**',
        removeTranslations: 'rm -rf translations-tmp app/translations public/js/app/translations.js public/js/min/translations.*',
        removeTemplates: 'rm -rf app/templates/compiled',
        removeAssets: 'rm -rf public/js/app public/js/min',
        removeStyles: 'rm -rf public/css',
        removeIcons: 'rm -rf public/images/**/icons',
        removeDist: 'rm -rf dist',
        removeDistGit: 'rm -rf dist/git',
        chmodDistStart: 'chmod 777 dist/start.sh'
    };
};
