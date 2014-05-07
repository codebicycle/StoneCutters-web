'use strict';

module.exports = function(grunt) {
    var languages = ['af', 'bs', 'el', 'es', 'ht', 'ja', 'ml', 'no', 'ro', 'sr', 'te', 'uk', 'ar', 'ca', 'en', 'gu', 'hu', 'kn', 'mr', 'pa', 'ru', 'sv', 'th', 'ur', 'cs', 'et', 'he', 'id', 'ko', 'ms', 'pl', 'si', 'sw', 'vi', 'bg', 'da', 'fi', 'hi', 'is', 'lt', 'sk', 'tl', 'zh', 'bn', 'de', 'fr', 'hr', 'it', 'lv', 'nl', 'pt', 'sl', 'ta', 'tr'];
    var config = require('./server/config');

    require('load-grunt-config')(grunt);

    grunt.registerTask('develop', function run() {
        grunt.util.spawn({
            cmd: 'npm',
            args: ['run-script', 'develop'],
            opts: {
                stdio: 'inherit'
            }
        }, function error(err) {
            grunt.fail.fatal(err.stack);
        });
    });

    grunt.registerTask('log', function log() {
        grunt.util.spawn({
            cmd: 'npm',
            args: ['run-script', 'debug'],
            opts: {
                stdio: 'inherit'
            }
        }, function error(err) {
            grunt.fail.fatal(err.stack);
        });
    });

    grunt.registerTask('dist', function dist() {
        grunt.util.spawn({
            cmd: './dist/start.sh',
            args: [grunt.option('environment') || 'testing'],
            opts: {
                stdio: 'inherit'
            }
        }, function error(err) {
            grunt.fail.fatal(err.stack);
        });
    });

    grunt.registerTask('translate', function translate() {
        var restler = require('restler');
        var rTranslations = new RegExp('{{ ?dictionary\\[[^}]+ ?}}', 'gi');
        var translations = {};
        var index = "'use strict';\n\nmodule.exports = {";
        var i = 0;

        grunt.file.recurse('app/templates', function each(abspath, rootdir, subdir, filename) {
            var file;
            var matches;

            if (filename.split('.').pop() !== 'html') {
                return;
            }
            file = grunt.file.read(abspath);
            matches = file.match(rTranslations);
            if (!matches) {
                return;
            }
            matches.forEach(function each(match) {
                var key = match.slice(match.indexOf('"') + 1, match.lastIndexOf('"'));

                translations[key] = key;
            });
        });
        languages.forEach(function each(language) {
            // TODO: wait for smaug
            /*restler.request('http://api-v2.olx.com/translation', {
                data: {
                    keys: {
                        keys: Object.keys(translations)
                    }
                }
            }).on('success', function success(body, res) {

            });*/
            var dictionary = "'use strict';\n\nmodule.exports = {";
            var j = 0;
            var key;

            if (i) {
                index += ',';
            }
            index += "\n    '" + language + "': require('./" + language + "')";
            i++;
            for (key in translations) {
                if (j) {
                    dictionary += ',';
                }
                dictionary += "\n    '" + key + "': '" + translations[key] + "'";
                j++;
            }
            dictionary += '\n};\n';
            grunt.file.write('app/translations/' + language + '.js', dictionary);
        });
        index += '\n};\n';
        grunt.file.write('app/translations/index.js', index);
    });

    grunt.registerTask('clean', ['exec:removeTranslations', 'exec:removeTemplates', 'exec:removeAssets', 'exec:removeStyles', 'exec:removeIcons', 'exec:removeDist']);

    grunt.registerTask('template', ['copy:templates', 'nunjucks']);

    if (config.get(['uglify', 'enabled'], true)) {
        grunt.registerTask('javascript', ['browserify', 'uglify']);
    }
    else {
        grunt.registerTask('javascript', ['browserify']);
    }

    grunt.registerTask('build', ['translate', 'template', 'javascript', 'stylus', 'copy:icons']);

    grunt.registerTask('compile', ['clean', 'build']);

    grunt.registerTask('jshint:node', ['jshint:server', 'jshint:client']);

    grunt.registerTask('start', ['compile', 'jshint:node', 'develop', 'watch']);

    grunt.registerTask('debug', ['compile', 'jshint:node', 'log', 'watch']);

    grunt.registerTask('prepipeline', ['compile', 'utest']);

    grunt.registerTask('pipeline', ['artifactory:static:publish', 'artifactory:dynamic:publish']);

    grunt.registerTask('pipetest', ['prepipeline', 'copy:dynamic', 'gitclone', 'copy:config', 'exec:removeDistGit', 'exec:chmodDistStart', 'dist', 'atest', 'watch:dist']);

    grunt.registerTask('utest', ['jshint:utests', 'mochacov:unit', 'mochacov:coverage']);

    grunt.registerTask('atest', ['jshint:atests', 'mochacov:acceptance']);
};
