'use strict';

var _ = require('underscore');
var isServer = typeof window === 'undefined';
var options = {};
if (isServer) {
    options.userAgent = 'Arwen/' + (process.env.NODE_ENV || 'development') + ' (node.js ' + process.version + ')';
}
var DataAdapter = require('../../shared/adapters/data');
var dataAdapter = new DataAdapter(options);

module.exports = {
    request: function(req, method, url, options, callback) {
        dataAdapter.request(req, {
            method: method,
            url: url
        }, options, callback);
    },
    post: function(req, url, options, callback) {
        this.request(req, 'post', url, options, callback);
    },
    get: function(req, url, options, callback) {
        this.request(req, 'get', url, options, callback);
    }
};
