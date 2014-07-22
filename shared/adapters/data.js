'use strict';

var PROTOCOL = 'http';
var HOST = 'api-v2.olx.com';

var _ = require('underscore');
var logger = require('../logger')('adapter data');
var utils = require('../utils');
var isServer = utils.isServer;

if (isServer) {
    var graphiteName = '../../server/graphite';
    var graphite = require(graphiteName)();
    var rGraphite = /\./g;
    var restlerName = 'restler';
    var restler = require(restlerName);
}

function DataAdapter(options) {
    this.options = options || {};
}

module.exports = DataAdapter;

DataAdapter.prototype.request = function(req, api, options, callback) {
    var syncMethod = isServer ? this.serverRequest : this.clientRequest;

    return syncMethod.apply(this, arguments);
};

DataAdapter.prototype.serverRequest = function(req, api, options, callback) {
    var location = req.rendrApp.session ? req.rendrApp.session.get('location') : null;
    var start = new Date().getTime();
    var elapsed;

    if (!isServer) {
        return this.clientRequest(req, api, options, callback);
    }
    if (options instanceof Function) {
        callback = options;
        options = {};
    }
    api = this.apiDefaults(api, req);
    restler.request(api.url, _.extend(api, options))
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
        logger.log('%s %d %s %s', api.method.toUpperCase(), res.statusCode, api.url, elapsed);
        if (location) {
            graphite.send([location.name, 'sockets', api.url.split('//')[1].split('/').shift().replace(rGraphite, '-'), 'success', res.statusCode], 1, '+');
        }
        callback(null, res, body);
    }

    function fail(err, res) {
        res = res || {
            statusCode: 599
        };
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
        logger.error('%s %d %s %j %s', api.method.toUpperCase(), res.statusCode, api.url, err, elapsed);
        if (location) {
            graphite.send([location.name, 'sockets', api.url.split('//')[1].split('/').shift().replace(rGraphite, '-'), 'error', res.statusCode], 1, '+');
        }
        graphite.send(['smaug', 'error', res.statusCode], 1, '+');
        callback(err, res);
    }
};

DataAdapter.prototype.clientRequest = function(req, api, options, callback) {
    var start = new Date().getTime();
    var elapsed;
    var done;
    var failed;

    if (isServer) {
        return this.serverRequest(req, api, options, callback);
    }

    if (options instanceof Function) {
        callback = options;
        options = {};
    }
    done = options.done || function noop() {};
    failed = options.fail || function noop() {};
    delete options.done;
    delete options.fail;

    var success = function(body, textStatus, res) {
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
        logger.log('%s %d %s %s', api.type.toUpperCase(), res.status, api.url, elapsed);
        done.apply(this, arguments);
    }.bind(this);

    var fail = function(res, textStatus, err) {
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
        logger.error('%s %d %s %j %s', api.type.toUpperCase(), res.status, api.url, err, elapsed);
        failed.apply(this, arguments);
    }.bind(this);

    api = this.apiDefaults(api, req);
    $.ajax(this.ajaxParams(api, options))
        .done(success.bind(this))
        .fail(fail.bind(this))
        .always(callback);
};

DataAdapter.prototype._request = function(method, req, url, options, callback) {
    this.request(req, {
        method: method,
        url: url
    }, options, callback);
};

DataAdapter.prototype.post = function(req, url, options, callback) {
    this._request('post', req, url, options, callback);
};

DataAdapter.prototype.get = function(req, url, options, callback) {
    this._request('get', req, url, options, callback);
};

DataAdapter.prototype.file = function(path, name, size, encoding, mime) {
    if (!isServer) {
        throw 'Restler library not available on the client';
    }
    return restler.file(path, name, size, encoding, mime);
};

DataAdapter.prototype.isJSONResponse = function(response) {
    var contentType = response.headers['content-type'] || '';

    return contentType.indexOf('application/json') !== -1;
};

DataAdapter.prototype.apiDefaults = function(api) {
    var urlOpts;
    var apiHost;

    api = _.clone(api);
    if (api.path) {
        api.url = api.path;
        delete api.path;
    }
    api.url = PROTOCOL + '://' + HOST + api.url;
    apiHost = this.options[api.api] || this.options['default'] || this.options || {};
    urlOpts = _.defaults(
        _.pick(api,     ['protocol', 'port', 'query']),
        _.pick(apiHost, ['protocol', 'port', 'host'])
    );
    _.defaults(api, {
        method: 'GET',
        headers: {}
    });
    if (isServer && !api.headers['User-Agent']) {
        api.headers['User-Agent'] = this.options.userAgent;
    }
    if (api.body && (!api.headers['Content-Type'] || api.headers['Content-Type'] == 'application/json')) {
        api.json = api.body;
    }
    if (api.method === 'GET') {
        delete api.json;
        delete api.body;
        delete api.data;
    }
    if (!isServer) {
        api.type = api.method;
        delete api.method;
    }
    return api;
};

DataAdapter.prototype.ajaxParams = function(api, options) {
    _.extend(api, options);
    if (api.query) {
        api.url = utils.params(api.url, api.query);
    }
    return api;
};

DataAdapter.prototype.getErrForResponse = function(res, options) {
    var status = Number(res.statusCode);
    var err;

    if (isErrorStatus(status, options)) {
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

function isErrorStatus(statusCode, options) {
    options = options || {};
    _.defaults(options, {
        allow4xx: false
    });
    statusCode = Number(statusCode);
    if (options.allow4xx) {
        return statusCode >= 500 && statusCode < 600;
    }
    else {
        return statusCode >= 400 && statusCode < 600;
    }
}
