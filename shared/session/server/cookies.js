'use strict';

var _ = require('underscore');
var utils = require('../../utils');

function Cookies(req, res, callback) {
    var host = req.host.split('.');
    var hasM = !!~host.indexOf('m');
    var domain = [''];
    var slice;

    if (host.length === 3 || !hasM) {
        slice = 1;
    }
    else {
        slice = 2;
    }
    domain = domain.concat(host.slice(slice)).join('.');
    this.getAll = function() {
        return _.clone(_.omit(req.cookies || {}, ['Expires']));
    };

    this.get = function(key, dephault) {
        if (req.cookies) {
            var value = req.cookies[key];

            return (typeof value === 'undefined' ? dephault : value);
        }
        return dephault;
    };

    this.put = function(key, value, options) {
        if (res.cookie) {
            try {
                encodeURIComponent(value);
            }
            catch (e) {
                return;
            }
            res.cookie(key, value, _.defaults({
                maxAge: 2 * utils.YEAR,
                domain: domain,
                overwrite: true
            }, options || {}));
        }
    };

    this.clear = function(key) {
        res.clearCookie(key, {
            path: '/'
        });
    };

    callback(this);
};

module.exports = Cookies;
