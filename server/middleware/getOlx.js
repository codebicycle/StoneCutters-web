'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var path = require('path');
        var statsd  = require('../modules/statsd')();
        var getOlx = {
            'get.olx.com': us,
            'get.olx.ir': ir
        };
        var hosts = Object.keys(getOlx);
        var templates = {};

        _.each(hosts, function each(host) {
            templates[host] = path.resolve('server/templates/getolx/' + host + '.html');
        });

        function us(req, res, next) {
            statsd.increment(['us', 'middleware', 'getolx']);
            next();
        }

        function ir(req, res, next) {
            statsd.increment(['ir', 'middleware', 'getolx']);
            //res.sendfile(templates[req.host]);
            next();
        }

        return function middleware(req, res, next) {
            if (!_.contains(hosts, req.host)) {
                return next();
            }
            getOlx[req.host](req, res, next);
        };
    };
};
