'use strict';

module.exports = function(dataAdapter, excludedUrls) {
    return function loader() {
        var fs = require('fs');
        var path = require('path');
        var _ = require('underscore');
        var closedPath = path.resolve('server/templates/closed.html');
        var translations = require('../../shared/translations');

        return function middleware(req, res, next) {
            if (req.path !== '/closed') {
                return next();
            }
            fs.readFile(closedPath, 'utf8', function callback(err, html) {
                var template = _.template(html);

                res.send(template({
                    dictionary: translations.get(req.rendrApp.session.get('selectedLanguage'))
                }));
            });
        };
    };
};
