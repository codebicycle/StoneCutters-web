'use strict';

module.exports = function(dataAdapter, excludedUrls) {
    return function loader() {
        var _ = require('underscore');
        var languages = ['af', 'ar', 'bg', 'bn', 'bs', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fi', 'fr', 'gu', 'he', 'hi', 'hr', 'ht', 'hu', 'id', 'is', 'it', 'ja', 'kn', 'ko', 'lt', 'lv', 'ml', 'mr', 'ms', 'nl', 'no', 'pa', 'pl', 'pt', 'ro', 'ru', 'si', 'sk', 'sl', 'sr', 'sv', 'sw', 'ta', 'te', 'th', 'tl', 'tr', 'uk', 'ur', 'vi', 'zh'];

        return function middleware(req, res, next) {
            var originalUrl = req.originalUrl.split('/');
            var language = originalUrl[1];

            if (!language || language.length !== 2 || !_.contains(languages, language)) {
                return next();
            }
            originalUrl = _.rest(originalUrl, 2);
            originalUrl.unshift('');
            res.redirect(originalUrl.join('/'));
        };
    };
};
