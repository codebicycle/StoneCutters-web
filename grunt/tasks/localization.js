'use strict';

module.exports = function(grunt) {

    return function task() {
        var asynquence = require('asynquence');
        var _ = require('underscore');
        var config = require('../../server/config');

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
            var dirPath = root + '/' + country;
            var dirStylePath = dirPath + '/stylesheets';
            var dirTemplatesPath = dirPath + '/templates';

            // Create country directory.
            create(dirPath);

            // Create styleheets directory.
            create(dirStylePath);
            create(dirStylePath + '/' + platform);

            // Create templates directory.
            create(dirTemplatesPath);
            create(dirTemplatesPath + '/' + platform);
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
