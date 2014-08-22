'use strict';

var _ = require('underscore');
var path = require('path');
var asynquence = require('asynquence');
var helpers = require('../helpers');
var statsd = require('../../shared/statsd')();
var utils = require('../../shared/utils');

module.exports = function(params, next) {
    if (!this.app.session.get('isServer')) {
        return next();
    }
    findDevice.call(this, next);
};

function findDevice(next) {
    if (this.app.session.get('excludeMiddlewares')) {
        return next();
    }
    var userAgent = this.app.req.get('user-agent') || utils.defaults.userAgent;

    var fetch = function(done) {
        helpers.dataAdapter.get(this.app.req, '/devices/' + encodeURIComponent(userAgent), done.errfcb);
    }.bind(this);
    
    var check = function(done, response, device) {
        if (!device) {
            console.log('[OLX_DEBUG] Empty device response: ' + (response ? response.statusCode : 'no response') + ' for ' + userAgent + ' on ' + this.app.session.get('host'));
            done.fail(new Error());
        }
        done(device);
    }.bind(this);

    var success = function(done, device) {
        if (device.browserName == 'Opera Mini') {
            var alternativeUA = ['device-stock-ua','x-operamini-phone-ua'];
            var headers = this.app.req.headers;
            var match;
            var i;

            for (i = alternativeUA.length - 1; i >= 0; i--) {
                if (alternativeUA[i] in headers) {
                    userAgent = headers[alternativeUA[i]];
                    if (device.osName == 'Android') {
                        match = userAgent.match(/Android [\d+\.]{3,5}/);
                        if (match) {
                            device.osVersion = match[0].replace('Android ','');
                        }
                    }
                    else if (device.osName == 'iOS') {
                        match = userAgent.match(/iPhone OS [\d+\_]{3,5}/);
                        if (match) {
                            device.osVersion = match[0].replace('iPhone OS ','');
                        }
                    }
                }
            }
        }
        if (device.osVersion === undefined) {
            device.osVersion = '0';
        }

        done(device);
    }.bind(this);

    var store = function(done, device) {
        var marketing = {
            osName: (device.osName || 'Others'),
            osVersion: parseFloat(String(device.osVersion).replace('_','.'))
        };

        if (device.browserName) {
            marketing.browserName = device.browserName;
        }
        this.app.session.persist(marketing);
        this.app.session.update({
            device: device
        });

        done();
    }.bind(this);

    var fail = function(err) {
        var location = this.app.session.get('location');
        var errorPath = path.resolve('server/templates/error.html');

        statsd.increment([location.name, 'middleware', 'templates', 'error']);
        next.abort();
        this.app.req.res.status(500).sendfile(errorPath);
    }.bind(this);

    asynquence().or(fail)
        .then(fetch)
        .then(check)
        .then(success)
        .then(store)
        .val(next);
}