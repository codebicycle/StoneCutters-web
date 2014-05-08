'use strict';

var _ = require('underscore');

module.exports = {
    getAll: function(req) {
        return _.omit(req.cookies || {}, ['Expires']);
    },
    get: function(req, key, dephault) {
        if (req.cookies) {
            key = req.cookies[key];
            return (typeof key === 'undefined' ? dephault : key);
        }
        return dephault;
    },
    put: function(res, key, value, options) {
        if (res.cookie) {
            res.cookie(key, value, options || {});
        }
    },
    clear: function(res, key) {
        res.clearCookie(key, { path: '/' });
    }
};
