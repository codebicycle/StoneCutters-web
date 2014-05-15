'use strict';

module.exports = function(grunt) {
    var languages = ['af-ZA', 'ar-AE', 'ar-EG', 'bg-BG', 'bn-BD', 'bs-BA', 'ca-ES', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR', 'en-IN', 'en-US', 'es-AR', 'es-CO', 'es-EC', 'es-ES', 'es-GT', 'es-MX', 'es-PE', 'es-SV', 'es-VZ', 'et-EE', 'fi-FI', 'fr-CA', 'fr-FR', 'gu-IN', 'he-IL', 'hi-IN', 'hr-HR', 'ht-HT', 'hu-HU', 'id-ID', 'is-IS', 'it-IT', 'ja-JP', 'kn-IN', 'ko-KR', 'lt-LT', 'lv-LV', 'ml-IN', 'mr-IN', 'ms-MY', 'nl-BG', 'nl-NL', 'no-NO', 'pa-PK', 'pl-PL', 'pt-BR', 'pt-PT', 'ro-RO', 'ru-RU', 'si-LK', 'sk-SK', 'sl-SI', 'sr-RS', 'sv-SE', 'sw-TZ', 'ta-IN', 'te-IN', 'th-TH', 'th-TW', 'tl-PH', 'tr-TR', 'uk-UA', 'ur-PK', 'vi-VN', 'zh-CN', 'zh-TW'];
    var includeKeys = ['misc.BrandFor_Mob', 'misc.FreeIn_Mob'];

    return function task() {
        var done = this.async();
        var destDir = process.cwd() + '/translations-tmp';
        var dest = destDir + '/translations.zip';
        var asynquence = require('asynquence');
        var restler = require('restler');
        var http = require('http');
        var ProgressBar = require('progress');
        var fs = require('fs');
        var unzip = require('unzip');
        var csv = require('csv');
        var _ = require('underscore');
        var jsesc = require('jsesc');
        var rTranslations = new RegExp('dictionary\\["[^"]+"]', 'gi');
        var translations = {};
        var i = 0;
        var file;
        var version;

        function fail(err) {
            function callback() {
                clean(throwError);
            }

            function throwError() {
                throw err;
            }

            if (file) {
                return file.close(callback);
            }
            callback();
        }

        function getVersion(done) {
            restler
                .get('http://elvira.olx.com.ar/tags/api/query.php?repo=smaug-translations&env=testing')
                .on('success', done)
                .on('error', done.fail)
                .on('fail', done.fail);
        }

        function create(done, version) {
            grunt.file.mkdir(destDir);
            file = fs.createWriteStream(dest).on('open', onOpen);

            function onOpen() {
                done(version);
            }
        }

        function download(done, version) {
            http.request({
                host: 'jfrog.olx.com.ar',
                path: '/artifactory/mobile-jenkins-release/olx/smaug-translations/smaug-translations-0.1.186.zip'
            }).on('response', onResponse).on('error', done.fail).end();

            function onResponse(res) {
                var total = parseInt(res.headers['content-length'], 10);
                var bar = new ProgressBar('downloading smaug-translations-' + version + '.zip [:bar] :percent :etas', {
                    complete: '=',
                    incomplete: ' ',
                    width: 20,
                    total: total
                });

                function onData(chunk) {
                    bar.tick(chunk.length);
                    file.write(chunk);
                }

                function onEnd() {
                    console.log();
                    file.close(done);
                }

                console.log();
                res
                    .on('data', onData)
                    .on('end', onEnd);
            }
        }

        function unZip(done) {
            fs.createReadStream(dest).pipe(unzip.Extract({
                path: destDir
            })).on('close', done).on('error', done.fail);
        }

        function getTranslations(done) {
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
                    var key = match.slice(match.indexOf('"') + 1, match.indexOf(']') - 1);

                    translations[key] = key;
                });
            });
            includeKeys.forEach(function each(key) {
                translations[key] = key;
            });
            translations = Object.keys(translations);
            done();
        }

        function getDictionaries(done) {
            var promise = asynquence().or(done.fail);
            var index = "'use strict';\n\nmodule.exports = {";
            var j = 0;

            languages.forEach(function each(language) {
                if (j) {
                    index += ',';
                }
                index += "\n    '" + language + "': require('./" + language + "')";
                j++;
                promise.then(eachDictionary);

                function eachDictionary(next) {
                    var dictionary = "'use strict';\n\nmodule.exports = {";
                    var i = 0;

                    csv().from(destDir + '/' + language + '.csv').on('data', function onData(data) {
                        data = data.split(',').slice(1);
                        if (_.contains(translations, data[0])) {
                            if (i) {
                                dictionary += ',';
                            }
                            dictionary += "\n    '" + data[0] + "': '" + jsesc(data[1]) + "'";
                            i++;
                        }
                    }).on('end', function onEnd() {
                        dictionary += '\n};\n';
                        grunt.file.write('app/translations/' + language + '.js', dictionary);
                        console.log('File "app/translations/' + language + '.js" created');
                        next();
                    });
                }
            });
            index += '\n};\n';
            grunt.file.write('app/translations/index.js', index);
            console.log('File "app/translations/index.js" created');
            promise.val(done);
        }

        function clean(done) {
            grunt.file.delete(destDir);
            done();
        }

        asynquence().or(fail)
            .then(getVersion)
            .then(create)
            .then(download)
            .then(unZip)
            .then(getTranslations)
            .then(getDictionaries)
            .then(clean)
            .val(done);
    };
};
