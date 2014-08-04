'use strict';

var _ = require('underscore');
var restler = require('restler');
var tracking = require('../shared/tracking');

function makeTrack(url, options, callback) {
    restler.get(url, options)
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
    var query;

    options = _.defaults({
        method: 'get'
    }, options);

    if (options.method === 'get') {
        query = {};
        _.each(params, function(value, key) {
            query[key] = encodeURIComponent(value);
        });
        options.query = query;
    }
    else {
        options.data = params;
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
