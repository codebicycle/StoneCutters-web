'use strict';

var utils = require('../utils');
var _ = require('underscore');
var url = require('url');
var restler = require('restler');
var log = require('debug')('arwen:adapter:data');
var logError = require('debug')('arwen:adapter:data:error');
var util = require('util');
var CONFIG = require('../../config').get('smaug', {});

function DataAdapter(options) {
    this.options = options || {};
}

module.exports = DataAdapter;

DataAdapter.prototype.request = function(req, api, options, callback) {
    var start = new Date().getTime();
    var elapsed;

    if (options instanceof Function) {
        callback = options;
        options = {};
    }
    api = this.apiDefaults(api, req);
    restler.request(CONFIG.protocol + '://' + CONFIG.host + api.url, _.extend(api, options))
        .on('success', success)
        .on('fail', fail)
        .on('error', fail);

    function success(body, res) {
        elapsed = getElapsed(start, elapsed);
        if (typeof body === 'string' && DataAdapter.prototype.isJSONResponse(res)) {
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
            err = DataAdapter.prototype.getErrForResponse(res, {
                allow4xx: options.allow4xx
            });
        }
        logError('%s %d %s %j %s', api.method.toUpperCase(), res.statusCode, api.url, err, elapsed);
        callback(err, res);
    }
};

DataAdapter.prototype.post = function(req, url, options, callback) {
    this._request('post', req, url, options, callback);
};

DataAdapter.prototype.get = function(req, url, options, callback) {
    this._request('get', req, url, options, callback);
};

DataAdapter.prototype.file = function(path, name, size, encoding, mime) {
    return restler.file(path, name, size, encoding, mime);
};

DataAdapter.prototype.isJSONResponse = function(response) {
    var contentType = response.headers['content-type'] || '';

    return contentType.indexOf('application/json') !== -1;
};

DataAdapter.prototype.apiDefaults = function(api, req) {
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

DataAdapter.prototype.getErrForResponse = function(res, options) {
    var status = Number(res.statusCode);
    var err;

    if (utils.isErrorStatus(status, options)) {
        err = new Error(status + " status");
        err.status = status;
        err.body = res.body;
    }
    return err;
};

function getElapsed(start, elapsed) {
    var end = new Date().getTime();

    if (elapsed) {
        return elapsed;
    }
    return '+' + (end - start) + 'ms';
}

DataAdapter.prototype._request = function(method, req, url, options, callback) {
    this.request(req, {
        method: method,
        url: url
    }, options, callback);
};
