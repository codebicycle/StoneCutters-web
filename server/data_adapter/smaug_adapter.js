'use strict';

var DataAdapter = require('./index');
var utils = require('../utils');
var _ = require('underscore');
var url = require('url');
var request = require('request');
var restler = require('restler');
var log = require('debug')('arwen:adapter:data');
var logError = require('debug')('arwen:adapter:data:error');
var util = require('util');
var CONFIG = require('../../config').get('smaug', {});

function SmaugAdapter(options) {
    DataAdapter.call(this, options);
}

module.exports = SmaugAdapter;

util.inherits(SmaugAdapter, DataAdapter);

/**
 * `request`
 *
 * This is method that Rendr calls to ask for data. In this case, we override
 * it to speak basic REST using HTTP & JSON. This is good for consuming an
 * existing RESTful API that exists externally to your Node app.
 *
 * `req`: Actual request object from Express/Connect.
 * `api`: Object describing API call; properties including 'path', 'query', etc.
 *        Passed to `url.format()`.
 * `options`: (optional) Options.
 * `callback`: Callback.
 */
SmaugAdapter.prototype.request = function(req, api, options, callback) {
    var start = new Date().getTime();

    if (arguments.length === 3) {
        callback = options;
        options = {};
    }
    if (api.headers) {
        api.headers.host = CONFIG.host;
    }
    options = _.defaults({}, options, {
        convertErrorCode: true,
        allow4xx: false
    });
    api = this.apiDefaults(api, req);
    api.url = CONFIG.protocol + '://' + CONFIG.host + api.url;
    request(api, function afterRequest(err, response, body) {
        var elapsed = '+' + (new Date().getTime() - start) + 'ms';

        if (options.convertErrorCode) {
            err = this.getErrForResponse(response, {
                allow4xx: options.allow4xx
            });
        }
        if (typeof body === 'string' && this.isJSONResponse(response)) {
            try {
                body = JSON.parse(body);
            }
            catch (error) {
                err = error;
            }
        }
        if (body && body.itemProperties === null){
            body.itemProperties = {};
        }
        if (err) {
            logError('%s %d %s %j %s', api.method.toUpperCase(), response.statusCode, api.url, err, elapsed);
        }
        else {
            log('%s %d %s %s', api.method.toUpperCase(), response.statusCode, api.url, elapsed);
        }
        callback(err, response, body);
    }.bind(this));
};

SmaugAdapter.prototype.isJSONResponse = function(response) {
    var contentType = response.headers['content-type'] || '';

    return contentType.indexOf('application/json') !== -1;
};

SmaugAdapter.prototype.apiDefaults = function(api, req) {
    var urlOpts, apiHost;

    api = _.clone(api);
    if (api.path && ~api.path.indexOf('://')) {
        api.url = api.path;
        delete api.path;
    }
    apiHost = this.options[api.api] || this.options['default'] || this.options || {};
    urlOpts = _.defaults(
        _.pick(api,     ['protocol', 'port', 'query']),
        _.pick(apiHost, ['protocol', 'port', 'host'])
    );
    urlOpts.pathname = api.path || api.pathname;
    _.defaults(api, {
        method: 'GET',
        url: url.format(urlOpts),
        headers: {}
    });
    if (!api.headers['User-Agent']) {
        api.headers['User-Agent'] = this.options.userAgent;
    }
    if (api.body && (!api.headers['Content-Type'] || api.headers['Content-Type'] == 'application/json')) {
        api.json = api.body;
    }
    if (api.method === 'GET' && Object.keys(api.body).length === 0) {
        delete api.json;
        delete api.body;
    }
    return api;
};

SmaugAdapter.prototype.getErrForResponse = function(res, options) {
    var status = Number(res.statusCode);
    var err;

    if (utils.isErrorStatus(status, options)) {
        err = new Error(status + " status");
        err.status = status;
        err.body = res.body;
    }
    return err;
};

SmaugAdapter.prototype.promiseRequest = function(req, api, options, done, fail) {
    if (options instanceof Function) {
        fail = done;
        done = options;
        options = {};
    }
    if (!fail) {
        fail = done.fail;
    }
    this.request(req, api, options, function requestDone(err, response, body) {
        if (err) {
            var error = {
                errCode: err.status,
                err: [],
                original: err
            };
            if (Array.isArray(body)) {
                body.forEach(function addError(err) {
                    error.err.push(err.message);
                });
            }
            else {
                error.err.push(body);
            }
            fail(error);
            return;
        }
        done(body);
    });
};

function getElapsed(start, elapsed) {
    var end = new Date().getTime();

    if (elapsed) {
        return elapsed;
    }
    return '+' + (end - start) + 'ms';
}

SmaugAdapter.prototype.newRequest = function(req, api, options, callback) {
    var start = new Date().getTime();
    var elapsed;

    if (arguments.length === 3) {
        callback = options;
        options = {};
    }
    if (!api.url && api.uri) {
        api.url = api.uri;
        delete api.uri;
    }
    api.method = (api.method && api.method.toLowerCase()) || 'get';
    restler.request(CONFIG.protocol + '://' + CONFIG.host + api.url, _.extend(api, options))
        .on('success', success)
        .on('fail', fail)
        .on('error', fail);

    function success(body, res) {
        elapsed = getElapsed(start, elapsed);
        if (typeof body === 'string' && SmaugAdapter.prototype.isJSONResponse(res)) {
            try {
                body = JSON.parse(body);
            }
            catch (err) {
                return fail(err, res);
            }
        }
        if (body && body.itemProperties === null){
            body.itemProperties = {};
        }
        log('%s %d %s %s', api.method.toUpperCase(), res.statusCode, api.url, elapsed);
        callback(null, res, body);
    }

    function fail(err, res) {
        elapsed = getElapsed(start, elapsed);
        try {
            err = JSON.parse(err);
        }
        catch (error) {}
        if (options.convertErrorCode) {
            err = SmaugAdapter.prototype.getErrForResponse(res, {
                allow4xx: options.allow4xx
            });
        }
        logError('%s %d %s %j %s', api.method.toUpperCase(), res.statusCode, api.url, err, elapsed);
        callback(err, res);
    }
};

SmaugAdapter.prototype.post = function(req, url, options, callback) {
    if (arguments.length === 3) {
        callback = options;
        options = {};
    }
    this.newRequest(req, {
        method: 'post',
        url: url
    }, options, callback);
};

SmaugAdapter.prototype.file = function(path, name, size, encoding, mime) {
    return restler.file(path, name, size, encoding, mime);
};
