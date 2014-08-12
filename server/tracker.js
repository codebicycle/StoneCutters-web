'use strict';

var _ = require('underscore');
var restler = require('restler');
var tracking = require('../shared/tracking');
var crypto = require('crypto');

function makeTrack(url, options, callback) {
    if (options.log) {
        var md5 = crypto.createHash('md5');
        var cid;

        md5.update(options.headers['User-Agent']);
        md5.update(options.log.ip);
        if (options.method === 'post') {
            cid = options.data.cid;
        }
        else {
            cid = options.query.idclient;
        }
        console.log('[OLX_DEBUG]', 'tracker:', options.log.tracker, '|', 'platform:', options.log.platform, '|', 'user:', md5.digest('hex'), '|', 'cid:', cid);
        delete options.log;
    }
    restler.request(url, options)
        .on('success', success)
        .on('fail', fail)
        .on('error', fail);

    function success(body, res) {
        if (callback) {
            callback(null, body, res);
        }
    }

    function fail(err, res) {
        if (callback) {
            callback(err, res);
        }
    }
}

function prepare(options, params) {
    options = _.defaults(options, {
        method: 'get',
        query: params
    });

    if (options.method === 'post') {
        options.data = options.query;
        delete options.query;
    }
    return options;
}

var Tracker = function(type, options) {
    this.type = type;
    this.options = options;
    this.debug = false;
};

Tracker.prototype.track = function(optionsTrack, optionsRequest, callback) {
    var api;
    var options;

    if (!tracking.has(this.type)) {
        return;
    }
    options = _.defaults({}, optionsTrack, this.options);
    api = tracking.generate(this.type, options, this.debug);
    if (api) {
        if (_.isFunction(optionsRequest)) {
            callback = optionsRequest;
            optionsRequest = {};
        }
        makeTrack(api.url, prepare(optionsRequest || {}, api.params), callback);
        return api.url;
    }
};

module.exports = Tracker;
