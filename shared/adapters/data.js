'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var logger = require('../logger')('adapter data');
var utils = require('../utils');
var statsd = require('../statsd')();
var config = require('../config');
var isServer = utils.isServer;
var rGraphite = /\./g;

var PROTOCOL = config.get(['smaug', 'protocol'], 'http');
var HOST = config.get(['smaug', 'host'], 'api-v2.olx.com');
var HOST_IRIS = config.get(['smaug', 'hostIris'], 'api-v2.olx.com');

if (isServer) {
    var restlerName = 'restler';
    var restler = require(restlerName);
    var memcachedModule = '../../server/modules/memcached';
    var memcached = require(memcachedModule);
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
    var locale = location ? location.abbreviation : 'all';
    var start = new Date().getTime();
    var elapsed;
    var key;

    if (!isServer) {
        return this.clientRequest(req, api, options, callback);
    }

    function prepare(done) {
        if (options instanceof Function) {
            callback = options;
            options = {};
        }
        api = this.apiDefaults(api, req);
        api = _.extend(api, options);
        if (req.rendrApp.session) {
            api.query = api.query || {};
            api.query.platform = req.rendrApp.session.get('platform');
            if (api.method.toUpperCase() !== 'GET') {
                api.data = api.data || {};
                api.data.ipAddress = req.rendrApp.session.get('ip');
            }
        }
        if (utils.endsWith(req.host, '.olx.ir')) {
            api.url = api.url.replace(HOST, HOST_IRIS);
        }
        done();
    }

    function cache(done) {
        key = this.getCacheKey(api);
        if (!key || !api.store) {
            return done();
        }
        memcached.get(key, after);

        function after(err, body) {
            if (err) {
                done.abort();
                return callback(err, {
                    statusCode: 598
                });
            }
            else if (body) {
                done.abort();
                return callback(null, {
                    statusCode: 200
                }, body);
            }
            done();
        }
    }

    function request(done) {
        if (~api.url.indexOf('/conversations')) {
            api.query.platform = 'android';
            api.query.version = '5.0.0';
            api.query.location = 'www.olx.cl';
            console.log(utils.params(api.url, api.query));
        }
        restler.request(api.url, api)
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
            if (body && body.itemProperties === null) {
                body.itemProperties = {};
            }
            logger.log('%s %d %s %s', api.method.toUpperCase(), res.statusCode, api.url, elapsed);
            statsd.increment([locale, 'sockets', api.url.split('//')[1].split('/').shift().replace(rGraphite, '-'), 'success', res.statusCode]);
            done(null, res, body);
        }

        function fail(err, res) {
            res = res || {
                statusCode: 599
            };
            elapsed = getElapsed(start, elapsed);
            if (!err && res.statusCode == 503) {
                err = 'Service Unavailable';
            }
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
            statsd.increment([locale, 'sockets', api.url.split('//')[1].split('/').shift().replace(rGraphite, '-'), 'error', res.statusCode]);
            err.statusCode = res.statusCode;
            done(err, res);
        }
    }

    function check(done, err, res, body) {
        if (err) {
            done.abort();
            return callback(err, res);
        }
        done(res, body);
    }

    function success(res, body) {
        if (api.store) {
            memcached.set(key, body, 360, utils.noop);
        }
        callback(null, res, body);
    }

    function fail(err) {
        callback(err, {
            statusCode: 598
        });
    }

    asynquence().or(fail.bind(this))
        .then(prepare.bind(this))
        .then(cache.bind(this))
        .then(request.bind(this))
        .then(check.bind(this))
        .val(success.bind(this));
};

DataAdapter.prototype.clientRequest = function(req, api, options, callback) {
    var location = window.App && window.App.session && _.isFunction(window.App.session.get) ? window.App.session.get('location') : null;
    var locale = location ? location.abbreviation : 'all';
    var start = new Date().getTime();
    var elapsed;
    var succeeded;
    var failed;

    if (isServer) {
        return this.serverRequest(req, api, options, callback);
    }

    function prepare(done) {
        if (options instanceof Function) {
            callback = options;
            options = {};
        }
        succeeded = options.done || function noop() {};
        failed = options.fail || function noop() {};
        delete options.done;
        delete options.fail;
        api = this.apiDefaults(api, req);
        done();
    }

    function request(done) {
        $.ajax(this.ajaxParams(api, options))
            .done(success.bind(this))
            .fail(fail.bind(this));

        function success(body, textStatus, res) {
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
            statsd.increment([locale, 'sockets', api.url.split('//')[1].split('/').shift().replace(rGraphite, '-'), 'success', res.status]);
            succeeded.apply(this, arguments);
            done(null, {
                readyState: res.readyState,
                responseText: res.responseText,
                statusCode: res.status,
                statusText: res.statusText,
                status: textStatus
            }, body);
        }

        function fail(res, textStatus, err) {
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
            statsd.increment([locale, 'sockets', api.url.split('//')[1].split('/').shift().replace(rGraphite, '-'), 'error', res.status]);
            failed.apply(this, arguments);
            done(err, {
                readyState: res.readyState,
                responseText: res.responseText,
                statusCode: res.status,
                statusText: res.statusText
            });
        }
    }

    function check(done, err, res, body) {
        if (err) {
            done.abort();
            return callback(err, res);
        }
        done(res, body);
    }

    function success(res, body) {
        callback(null, res, body);
    }

    function fail(err) {
        callback(err, {
            statusCode: 598
        });
    }

    asynquence().or(fail.bind(this))
        .then(prepare.bind(this))
        .then(request.bind(this))
        .then(check.bind(this))
        .val(success.bind(this));
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
    if (api.method.toUpperCase() === 'GET') {
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
    var data;

    _.extend(api, options);
    if (api.query) {
        api.url = utils.params(api.url, api.query);
    }
    if (utils.endsWith(window.location.hostname, '.olx.ir')) {
        api.url = api.url.replace(HOST, HOST_IRIS);
    }
    if (api.data && api.multipart) {
        data = new FormData();
        Object.keys(api.data).forEach(function each(key) {
            data.append(key, api.data[key]);
        });
        api.data = data;
    }
    if (~api.url.indexOf('/conversations')) {
        _.extend(api[api.data ? 'data' : 'query'], {
            platform: 'android',
            version: '5.0.0'
        });
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

DataAdapter.prototype.getCacheKey = function(api) {
    var key = [];

    if (api.method.toUpperCase() !== 'GET') {
        return;
    }
    key.push(api.url);
    key.push(JSON.stringify(utils.sort(_.omit(api.query || {}, 'platform'))));
    return key.join(':');
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
