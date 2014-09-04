'use strict';

var config = require('../config');
var utils = require('../../shared/utils');
var statsd = require('./statsd')();

var env = process.env.NODE_ENV || 'development';
var path = require('path');
var errorPath = path.resolve('server/templates/error.html');

exports = module.exports = function errorHandler() {
    function isRedirection(app) {
        if (!app || !app.session) {
            return true;
        }
        if (app.session.get('errorDirection')) {
            app.session.clear('errorDirection');
            return true;
        }
        app.session.persist({
            errorDirection: true
        });
        return false;
    }

    return function errorHandler(err, req, res, next) {
        var accept = req.headers.accept || '';

        if (err.status) {
            res.statusCode = err.status;
        }
        if (res.statusCode < 400) {
            res.statusCode = 500;
        }
        if (env === 'development') {
            console.error(err.stack || err);
        }
        if (isRedirection(req.rendrApp)) {
            statsd.increment(['All', 'errors', 503]);
            return res.status(500).sendfile(errorPath);
        }
        if (~accept.indexOf('html')) {
            if (config.get(['error', 'detail'], true)) {
                req.rendrApp.session.persist({
                    error: {
                        statusCode: res.statusCode,
                        message: err.message,
                        detail: err.stack
                    }
                });
            }
            res.redirect(utils.link('/500', req.rendrApp));
        }
        else if (~accept.indexOf('json')) {
            var error = { message: err.message };
            if (config.get(['error', 'detail'], true)) {
                error.stack = err.stack;
            }
            for (var prop in err) {
                error[prop] = err[prop];
            }
            var json = JSON.stringify({ error: error });

            statsd.increment(['All', 'errors', 'json']);
            res.setHeader('Content-Type', 'application/json');
            res.end(json);
        }
        else {
            statsd.increment(['All', 'errors', 'plain']);
            res.setHeader('Content-Type', 'text/plain');
            res.end(config.get(['error', 'detail'], true) ? err.stack : err.toString());
        }
    };
};
