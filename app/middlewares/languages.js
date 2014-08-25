'use strict';

var _ = require('underscore');
var path = require('path');
var URLParser = require('url');
var asynquence = require('asynquence');
var helpers = require('../helpers');
var statsd = require('../../shared/statsd')();
var utils = require('../../shared/utils');

module.exports = function(params, next) {
    var selectedLanguage;
    var languages;
    var language;
    var url;

    if (!this.app.session.get('isServer')) {
        selectedLanguage = this.app.session.get('selectedLanguage');
        languages = this.app.session.get('languages');
        language = params.language || '';

        if (checkRedirection.call(this, languages, language)) {
            url = URLParser.parse(this.app.session.get('url'));
            url = [url.pathname, (url.search || '')].join('');

            next.abort();
            return helpers.common.redirect.call(this.app.router || this, url, null, {
                status: 200
            });
        }
        if (!params || !language || selectedLanguage === language || !languages._byId[language]) {
            return next();
        }
        this.app.session.persist({
            selectedLanguage: language
        });
        return next();
    }
    findLanguages.call(this, next);
};

function checkRedirection(languages, language) {
    var selectedLanguage = this.app.session.get('selectedLanguage');

    if (selectedLanguage === languages.models[0].locale && language) {
        return true;
    }
    else if (selectedLanguage !== languages.models[0].locale && !language) {
        return true;
    }
    else if (language && language !== selectedLanguage) {
        return true;
    }
    return false;
}

function findLanguages(next) {
    if (this.app.session.get('excludeMiddlewares')) {
        return next();
    }
    var location = this.app.session.get('location');
    var userAgent = this.app.req.get('user-agent') || utils.defaults.userAgent;
    var selectedLanguage;
    var languages;

    var fetch = function(done) {
        helpers.dataAdapter.get(this.app.req, '/countries/' + this.app.session.get('siteLocation') + '/languages', done.errfcb);
    }.bind(this);

    var parse = function(done, response, _languages) {
        if (!_languages) {
            console.log('[OLX_DEBUG] Empty languages response: ' + (response ? response.statusCode : 'no response') + ' for ' + userAgent + ' on ' + this.app.session.get('host'));
            return done.fail(new Error());
        }
        languages = {
            models: _languages,
            _byId: {}
        };
        languages.models.forEach(function each(language) {
            languages._byId[language.locale] = language;
        });

        done();
    }.bind(this);

    var transition = function(done) {
        var lastSelectedLanguage = this.app.session.get('selectedLanguage');

        if (!isNaN(lastSelectedLanguage)) {
            this.app.session.clear('selectedLanguage');
        }
        done();
    }.bind(this);

    var select = function(done) {
        var language = this.app.req.param('language', '');

        if (language && !languages._byId[language]) {
            language = null;
        }
        selectedLanguage = language || this.app.session.get('selectedLanguage') || languages.models[0].locale;
        done();
    }.bind(this);

    var store = function(done) {
        this.app.session.update({
            languages: languages
        });
        this.app.session.persist({
            selectedLanguage: selectedLanguage
        });
        done();
    }.bind(this);

    var check = function(done) {
        var language = this.app.req.param('language', '');

        if (checkRedirection.call(this, languages, language)) {
            done.abort();
            return this.app.req.res.redirect(302, utils.link(this.app.req.originalUrl, this.app));
        }
        done();
    }.bind(this);

    var fail = function(err) {
        var errorPath = path.resolve('server/templates/error.html');

        statsd.increment([location.name, 'middleware', 'languages', 'error']);
        next.abort();
        this.app.req.res.status(500).sendfile(errorPath);
    }.bind(this);

    asynquence().or(fail)
        .then(fetch)
        .then(parse)
        .then(transition)
        .then(select)
        .then(store)
        .then(check)
        .val(next);
}
