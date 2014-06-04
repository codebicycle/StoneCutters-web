'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var utils = require('../utils');
        var _ = require('underscore');

        return function redirections(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }

            var path = req.rendrApp.getSession('path');

            if (path.length <= 1 || path.slice(-1) !== '/') {
                return next();
            }
            res.redirect(301, utils.link(path.slice(0, -1), req.rendrApp.getSession('siteLocation')));
        };

    };

};
