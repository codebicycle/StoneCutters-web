'use strict';

module.exports = function(dataAdapter, excludedUrls) {
    return function loader() {
        var path = require('path');
        var templatePath = path.resolve('server/templates/localstorageiframe.html');

        return function middleware(req, res, next) {
            if (req.path !== '/localstorageiframe.php' && req.path !== '/localstorageiframe') {
                return next();
            }
            res.sendfile(templatePath);
        };
    };
};
