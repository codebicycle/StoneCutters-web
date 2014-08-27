'use strict';

module.exports = function(dataAdapter, excludedUrls) {

    return function loader() {
        var _ = require('underscore');
        var path = require('path');
        var asynquence = require('asynquence');
        var statsd = require('../modules/statsd')();
        var utils = require('../../shared/utils');
        var errorPath = path.resolve('server/templates/error.html');

        return function middleware(req, res, next) {
            if (_.contains(excludedUrls.all, req.path)) {
                return next();
            }
            var userAgent = req.get('user-agent') || utils.defaults.userAgent;
            
            var fetch = function(done) {
                dataAdapter.get(req, '/devices/' + encodeURIComponent(userAgent), done.errfcb);
            }.bind(this);
            
            var check = function(done, response, device) {
                if (!device) {
                    console.log('[OLX_DEBUG] Empty device response: ' + (response ? response.statusCode : 'no response') + ' for ' + userAgent + ' on ' + req.rendrApp.session.get('host'));
                    done.fail(new Error());
                }
                done(device);
            }.bind(this);

            var success = function(done, device) {
                if (device.browserName == 'Opera Mini') {
                    var alternativeUA = ['device-stock-ua','x-operamini-phone-ua'];
                    var headers = req.headers;
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
                req.rendrApp.session.persist(marketing);
                req.rendrApp.session.update({
                    device: device
                });

                done();
            }.bind(this);

            var fail = function(err) {
                var location = req.rendrApp.session.get('location');

                statsd.increment([location.name, 'middleware', 'templates', 'error']);
                next.abort();
                res.status(500).sendfile(errorPath);
            }.bind(this);

            asynquence().or(fail)
                .then(fetch)
                .then(check)
                .then(success)
                .then(store)
                .val(next);
        };
    };
};