'use strict';

module.exports = function(dataAdapter, excludedUrls) {
    return function loader() {
        return function middleware(req, res, next) {
            var via = req.get('via');

            if (via && ~via.indexOf('Internet.org')) {
                req.rendrApp.session.persist({
                    'internet.org': true
                });
            }
            next();
        };
    };
};
