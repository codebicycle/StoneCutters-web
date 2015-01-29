'use strict';

module.exports = function(dataAdapter, excludedUrls) {
    return function loader() {
        var _ = require('underscore');
        var crypto = require('crypto');

        var SECRET = '2014ArwEn2015';
        var securities = {
            reply: {
                fn: reply,
                r: /^\/iid-([0-9]+)\/reply$/i
            }
        };

        function reply(req) {
            var match = securities.reply.r.exec(req.path);
            var clientId = req.rendrApp.session.get('clientId');

            if (!match || !clientId) {
                return;
            }
            req.rendrApp.session.persist({
                st: crypto
                    .createHash('sha512')
                    .update(SECRET)
                    .update(clientId)
                    .update(match[1])
                    .digest('hex')
            });
        }

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path) || req.method !== 'GET') {
                return next();
            }
            _.each(securities, function each(security) {
                security.fn(req);
            });
            next();
        };
    };
};
