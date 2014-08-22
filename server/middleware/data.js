'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        
        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                req.rendrApp.session.update({
                    excludeMiddlewares: true
                });
            }
            next();
        };
    };

};
