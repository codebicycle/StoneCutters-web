'use strict';

module.exports = function(dataAdapter, excludedUrls) {
    return function loader() {
        var _ = require('underscore');
        var crypto = require('crypto');
        var statsd  = require('../modules/statsd')();

        var SECRET = '2014ArwEn2015';
        var securities = {
            reply: {
                fn: reply,
                r: /^\/items\/([0-9]+)\/reply$/i
            }
        };

        function reply(req) {
            var match = securities.reply.r.exec(req.path);
            var clientId = req.rendrApp.session.get('clientId');
            var st = req.rendrApp.session.get('st');

            if (match && (!clientId || !st || st !== crypto
                                                        .createHash('sha512')
                                                        .update(SECRET)
                                                        .update(clientId)
                                                        .update(match[1])
                                                        .digest('hex'))) {
                return true;
            }
        }

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path) || req.method !== 'POST') {
                return next();
            }
            if (!_.find(securities, function each(security) {
                return security.fn(req);
            })) {
                return next();
            }
            statsd.increment([req.rendrApp.session.get('location').abbreviation, 'middleware', 'security', 403]);
            res.status(403).end();
        };
    };
};
