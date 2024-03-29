'use strict';

module.exports = function(grunt) {
    var rBrand = /<<BRAND>>/g;
    var BRAND = 'OLX';

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
        var config = require('../config');
        var languages = config.get(['translations', 'languages'], []);
        var includeKeys = config.get(['translations', 'keys'], []);
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

        function localVersion(done) {
            done((grunt.file.exists(destDir + '/TAG')) ? grunt.file.read(destDir + '/TAG').trim() : false);
        }

        function remoteVersion(done) {
            restler.get('http://elvira.olx.com.ar/tags/api/query.php?repo=smaug-translations&env=testing')
                .on('error', done.fail)
                .on('fail', done.fail)
                .on('success', function onSuccess(data) {
                    done(data);
                });
        }

        function decide(done, local, remote) {
            if (local === remote) {
                console.log('\nLocal files version (' + local + ') is up to date with remote (' + remote + ')');
                done();
            }
            else {
                if (local) {
                    console.log('\nLocal files version (' + local + ') is outdated from remote (' + remote + ')\n');
                }
                else {
                    console.log('\nLocal files are missing\n');
                }
                asynquence(remote).or(done.fail)
                    .then(clean)
                    .then(create)
                    .then(download)
                    .then(unZip)
                    .val(done);
            }
        }

        function clean(done, version) {
            if (grunt.file.exists(destDir)) {
                grunt.file.delete(destDir);
            }
            done(version);
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
                path: '/artifactory/mobile-jenkins-release/olx/smaug-translations/smaug-translations-' + version + '.zip'
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
                    file.end(done);
                }

                res
                    .on('data', onData)
                    .on('end', onEnd);
            }
        }

        function unZip(done) {
            fs.createReadStream(dest).pipe(unzip.Extract({
                path: destDir
            })).on('close', done).on('end', done).on('error', done.fail);
        }

        function getTranslations(done) {
            grunt.file.recurse('app/localized', function each(abspath, rootdir, subdir, filename) {
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

            languages.forEach(function each(language) {
                promise.then(eachDictionary);

                function eachDictionary(next) {
                    var dictionary = "'use strict';\n\nmodule.exports = {";
                    var i = 0;

                    csv().from(destDir + '/' + language + '.csv').on('record', function onData(record) {
                        record = record.slice(1);
                        if (_.contains(translations, record[0])) {
                            if (i) {
                                dictionary += ',';
                            }
                            dictionary += "\n    '" + record[0] + "': '" + jsesc(record[1].replace(rBrand, BRAND)) + "'";
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
            promise.val(done);
        }

        asynquence().or(fail)
            .gate(localVersion, remoteVersion)
            .then(decide)
            .then(getTranslations)
            .then(getDictionaries)
            .val(done);
    };
};
