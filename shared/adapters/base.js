'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var logger = require('../logger')('adapter base');
var utils = require('../utils');
var statsd = require('../statsd')();
var config = require('../config');
var isServer = utils.isServer;
var rGraphite = /\./g;

if (isServer) {
    var restlerName = 'restler';
    var restler = require(restlerName);
}

function BaseAdapter(options) {
    this.options = options || {};
}

module.exports = BaseAdapter;

BaseAdapter.prototype.request = function(req, api, options, callback) {
    var syncMethod = isServer ? this.serverRequest : this.clientRequest;

    return syncMethod.apply(this, arguments);
};

BaseAdapter.prototype.serverRequest = function(req, api, options, callback) {
    var location = req.rendrApp.session ? req.rendrApp.session.get('location') : null;
    var locale = location ? location.abbreviation : 'all';
    var start = new Date().getTime();
    var elapsed;

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
            if (api.method.toUpperCase() !== 'GET') {
                api.data = api.data || {};
            }
        }
        done();
    }

    function request(done) {
        var request = restler.request(api.url, api)
            .on('success', success)
            .on('fail', fail)
            .on('error', fail);

        if (api.timeout !== undefined && api.onTimeout) {
            request.on('timeout', api.onTimeout);
        }

        function success(body, res) {
            elapsed = getElapsed(start, elapsed);
            logger.log('%s %d %s %s', api.method.toUpperCase(), res.statusCode, api.url, elapsed);
            statsd.increment([locale, 'sockets', api.url.split('//')[1].split('/').shift().replace(rGraphite, '-'), 'success', res.statusCode]);
            done(null, res, body);
        }

        function fail(err, res) {
            elapsed = getElapsed(start, elapsed);
            logger.error('%s %d %s %j %s', api.method.toUpperCase(), res.statusCode, api.url, err, elapsed);
            statsd.increment([locale, 'sockets', api.url.split('//')[1].split('/').shift().replace(rGraphite, '-'), 'error', res.statusCode]);
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

BaseAdapter.prototype.clientRequest = function(req, api, options, callback) {
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
            logger.log('%s %d %s %s', options.type.toUpperCase(), res.status, options.url, elapsed);
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
            logger.error('%s %d %s %j %s', options.type.toUpperCase(), res.status, options.url, err, elapsed);
            failed.apply(this, arguments);
            done(err || {
                statusCode: res.status
            }, {
                readyState: res.readyState,
                responseText: res.responseText,
                statusCode: res.status,
                statusText: res.statusText
            }, res.responseText);
        }
    }

    function check(done, err, res, body) {
        if (err) {
            done.abort();
            return callback(err, res, body);
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

BaseAdapter.prototype._request = function(method, req, url, options, callback) {
    this.request(req, {
        method: method,
        url: url
    }, options, callback);
};

BaseAdapter.prototype.post = function(req, url, options, callback) {
    this._request('post', req, url, options, callback);
};

BaseAdapter.prototype.get = function(req, url, options, callback) {
    this._request('get', req, url, options, callback);
};

BaseAdapter.prototype.file = function(path, name, size, encoding, mime) {
    if (!isServer) {
        throw 'Restler library not available on the client';
    }
    return restler.file(path, name, size, encoding, mime);
};

BaseAdapter.prototype.apiDefaults = function(api, req) {
    api = _.clone(api);
    if (api.path) {
        api.url = api.path;
        delete api.path;
    }
    _.defaults(api, {
        method: 'GET',
        headers: {}
    });
    if (isServer && !api.headers['User-Agent']) {
        api.headers['User-Agent'] = this.options.userAgent || (isServer ? utils.getUserAgent(req) : navigator.userAgent);
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

BaseAdapter.prototype.ajaxParams = function(api, options) {
    var data;

    _.extend(api, options);
    if (api.query) {
        api.url = utils.params(api.url, api.query);
    }
    if (api.data && api.multipart) {
        data = new FormData();
        Object.keys(api.data).forEach(function each(key) {
            data.append(key, api.data[key]);
        });
        api.data = data;
    }
    return api;
};

function getElapsed(start, elapsed) {
    var end = new Date().getTime();

    if (elapsed) {
        return elapsed;
    }
    return '+' + (end - start) + 'ms';
}
