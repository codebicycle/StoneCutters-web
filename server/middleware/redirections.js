'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var utils = require('../utils');

        return function platform(req, res, next) {
            var path = req.rendrApp.getSession('path');

            if (path.length <= 1 || path.slice(-1) !== '/') {
                return next();
            }
            res.redirect(301, utils.link(path.slice(0, -1), req.rendrApp.getSession('siteLocation')));
        };

    };

};
