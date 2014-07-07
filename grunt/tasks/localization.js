'use strict';

module.exports = function(grunt) {

    return function task() {
        var asynquence = require('asynquence');
        var _ = require('underscore');
        var config = require('../../app/config');

        var done = this.async();
        var root = 'app/localized';

        function localize(done) {
            _.each(config.get('localization', {}), function(countries, platform) {
                if (countries.length) {
                    countries.forEach(function(country) {
                        check(country, platform);
                    });
                }
            });
            done();
        }

        function check(country, platform) {
            var dir = root + '/' + country;
            var stylesheets = dir + '/stylesheets';
            var templates = dir + '/templates';
            var views = dir + '/app/views';

            create(dir);
            create(stylesheets);
            create(stylesheets + '/' + platform);
            create(templates);
            create(templates + '/' + platform);
            create(views + '/' + platform);
        }

        function create(filePath) {
            if (!grunt.file.exists(filePath)) {
                grunt.file.mkdir(filePath);
            }
        }

        function fail(err) {
            throw err;
        }

        asynquence().or(fail)
            .then(localize)
            .val(done);
    };
};
