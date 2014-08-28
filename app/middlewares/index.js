'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var middlewares = {
    environment: require('./environment'),
    redirections: require('./redirections'),
    location: require('./location'),
    languages: require('./languages'),
    interstitial: require('./interstitial')
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
