'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var path = require('path');
        var asynquence = require('asynquence');
        var statsd  = require('../modules/statsd')();
        var utils = require('../../shared/utils');
        var errorPath = path.resolve('server/templates/error.html');

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }

            var location = req.rendrApp.session.get('location');
            var siteLocation = req.rendrApp.session.get('siteLocation');
            var host = req.rendrApp.session.get('host');
            var userAgent = utils.getUserAgent(req);
            var language = req.param('language');

            function fetch(done) {
                req.rendrApp.fetch({
                    languages: {
                        collection: 'Languages',
                        params: {
                            location: location.url
                        }
                    }
                }, {
                    readFromCache: false,
                    writeToCache: false,
                    store: true
                }, done.errfcb);
            }

            function select(done, response) {
                var languages = response.languages;
                var selectedLanguage = language || req.rendrApp.session.get('selectedLanguage');

                if (!selectedLanguage || !languages.get(selectedLanguage)) {
                    selectedLanguage = languages.getDefault();
                }
                req.rendrApp.session.update({
                    languages: {
                        models: languages.toJSON(),
                        _byId: _.object(Object.keys(languages._byId), _.values(languages._byId).map(function each(language) {
                            return language.toJSON();
                        }))
                    }
                });
                req.rendrApp.session.persist({
                    selectedLanguage: selectedLanguage
                });
                done(languages, selectedLanguage);
            }

            function redirect(done, languages, selectedLanguage) {
                if (selectedLanguage === languages.getDefault() && language) {
                    done.abort();
                    return res.redirect(302, utils.removeParams(utils.link(req.protocol + '://' + host + req.originalUrl, req.rendrApp), 'language'));
                }
                if (selectedLanguage !== languages.getDefault() && (!language || selectedLanguage !== language)) {
                    done.abort();
                    return res.redirect(302, utils.link(req.protocol + '://' + host + req.originalUrl, req.rendrApp, {
                        language: selectedLanguage
                    }));
                }
                done();
            }

            function fail(err) {
                statsd.increment([location.name, 'middleware', 'languages', 'error']);
                res.status(500).sendfile(errorPath);
            }

            asynquence().or(fail)
                .then(fetch)
                .then(select)
                .then(redirect)
                .val(next);
        };

    };

};
