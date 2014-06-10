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
    request: function(method, url, options, callback) {
        dataAdapter.request(null, {
            method: method,
            url: url
        }, options, callback);
    }
};
