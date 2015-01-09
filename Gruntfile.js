'use strict';

var _ = require('underscore');
var config = require('./grunt/config/translations');

module.exports = function(grunt) {
    require('./grunt')(grunt);

    grunt.registerTask('clean', ['exec:removeTemplates', 'exec:removeAssets', 'exec:removeStyles', 'exec:removeIcons', 'exec:removeDist']);

    grunt.registerTask('template', ['copy:templates', 'nunjucks']);

    grunt.registerTask('javascript', ['browserify', 'uglify']);

    grunt.registerTask('sprites', ['sprite', 'copy:sprites']);

    grunt.registerTask('icons', ['copy:icons', 'sprites']);

    grunt.registerTask('build', ['template', 'javascript', 'icons', 'stylus']);

    grunt.registerTask('compile', ['clean', 'build']);

    grunt.registerTask('jshint:node', ['jshint:server', 'jshint:client']);

    grunt.registerTask('start', ['compile', 'env', 'jshint:node', 'csslint:lax', 'concurrent:start']);

    grunt.registerTask('debug', ['compile', 'env', 'jshint:node', 'csslint:lax', 'concurrent:debug']);

    grunt.registerTask('prepipeline', ['compile', 'test']);

    grunt.registerTask('pipeline', ['artifactory:static:publish', 'artifactory:dynamic:publish']);

    grunt.registerTask('pipetest', ['prepipeline', 'copy:dynamic', 'gitclone:config', 'copy:config', 'exec:removeDistGit', 'exec:chmodDistStart', 'dist', 'watch:dist']);

    grunt.registerTask('test', ['jshint:tests', 'mochaTest']);

    grunt.registerTask('cover', ['jshint:tests', 'exec:removeCoverage', 'jscoverage', 'coverage']);

    grunt.registerTask('localize', ['localization']);

    grunt.registerTask('translate', ['exec:removeTranslations', 'translations'].concat(_.map(config.languages, function each(language) {
        return 'browserify:translations-' + language;
    })).concat(['uglify:common']));
};
