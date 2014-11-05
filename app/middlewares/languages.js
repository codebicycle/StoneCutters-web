'use strict';

var URLParser = require('url');
var helpers = require('../helpers');

module.exports = function(params, next) {
    if (this.app.session.get('isServer')) {
        return next();
    }

    var selectedLanguage = this.app.session.get('selectedLanguage');
    var languages = this.app.session.get('languages');
    var language = params.language || '';
    var url;

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
    next();
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
