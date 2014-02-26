'use strict';

var DataAdapter = require('./index');
var utils = require('../utils');
var _ = require('underscore');
var url = require('url');
var request = require('request');
var debug = require('debug')('rendr:SmaugAdapter');
var util = require('util');

module.exports = SmaugAdapter;

function SmaugAdapter(options) {
    DataAdapter.call(this, options);
  _.defaults(this.options, {
        userAgent: 'Rendr SmaugAdapter; Node.js'
    });
};
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
    if (arguments.length === 3) {
        callback = options;
        options = {};
    }
    if (api.headers) {
        api.headers.host = "api-v2.olx.com";
    }
    options = _.defaults({}, options, {
        convertErrorCode: true,
        allow4xx: false
    });
    api = this.apiDefaults(api, req);
    var start = new Date().getTime();
    var end;
    api.url = "http://api-v2.olx.com"+api.url;
    request(api, function afterRequest(err, response, body) {
        if (err) {
            return callback(err);
        }
        end = new Date().getTime();
        debug('%s %s %s %sms', api.method.toUpperCase(), api.url, response.statusCode, end - start);
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
    if (api.headers['User-Agent'] == null) {
        api.headers['User-Agent'] = this.options.userAgent;
    }
    if (api.body != null && (!api.headers['Content-Type'] || api.headers['Content-Type'] == 'application/json')) {
        api.json = api.body;
    }
    if (api.method === 'GET' && Object.keys(api.body).length === 0) {
        delete api.json;
        delete api.body;
    }
    return api;
};

SmaugAdapter.prototype.getErrForResponse = function(res, options) {
    var status = +res.statusCode,
    err = null;
    if (utils.isErrorStatus(status, options)) {
        err = new Error(status + " status");
        err.status = status;
        err.body = res.body;
    }
    return err;
};
