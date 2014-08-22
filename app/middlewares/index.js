'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var middlewares = {
    device: require('./device'),
    environment: require('./environment'),
    redirections: require('./redirections'),
    interstitial: require('./interstitial'),
    languages: require('./languages')
};

module.exports = function(controller, exclude) {
    exclude = exclude || [];
    if (!Array.isArray(exclude)) {
        exclude = [exclude];
    }
    return function execute(params, callback) {
        var promise = asynquence().or(function fail(err) {
            callback(err);
        });

        for (var middleware in middlewares) {
            if (!_.contains(exclude, middleware)) {
                promise.then(middlewares[middleware].bind(this, params));
            }
        }
        promise.val(controller.bind(this, params, callback));
    };
};