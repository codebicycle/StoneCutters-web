'use strict';

module.exports = function(grunt) {
    require('./grunt')(grunt);

    grunt.registerTask('clean', ['exec:removeTemplates', 'exec:removeAssets', 'exec:removeStyles', 'exec:removeIcons', 'exec:removeDist']);

    grunt.registerTask('template', ['copy:templates', 'nunjucks']);

    grunt.registerTask('javascript', ['browserify', 'uglify']);

    grunt.registerTask('translate', ['exec:removeTranslations', 'translations', 'browserify:translations', 'uglify:common']);

    grunt.registerTask('sprites', ['sprite', 'copy:sprites']);

    grunt.registerTask('icons', ['copy:icons', 'sprites']);

    grunt.registerTask('build', ['template', 'javascript', 'icons', 'stylus']);

    grunt.registerTask('compile', ['clean', 'build']);

    grunt.registerTask('jshint:node', ['jshint:server', 'jshint:client']);

    grunt.registerTask('start', ['compile', 'jshint:node', 'csslint:lax', 'concurrent:start']);

    grunt.registerTask('debug', ['compile', 'jshint:node', 'csslint:lax', 'concurrent:debug']);

    grunt.registerTask('prepipeline', ['compile', 'utest']);

    grunt.registerTask('pipeline', ['artifactory:static:publish', 'artifactory:dynamic:publish']);

    grunt.registerTask('pipetest', ['prepipeline', 'copy:dynamic', 'gitclone:config', 'copy:config', 'exec:removeDistGit', 'exec:chmodDistStart', 'dist', 'watch:dist']);

    grunt.registerTask('utest', ['jshint:tests', 'mochacov:unit']);

    grunt.registerTask('cover', ['jshint:tests', 'mochacov:coverage']);

    grunt.registerTask('test', ['utest', 'mochacov:coverage']);

    grunt.registerTask('localize', ['localization']);
};
