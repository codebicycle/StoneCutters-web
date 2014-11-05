'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Seo = require('../modules/seo');
var middlewares = {
    environment: require('./environment'),
    redirections: require('./redirections'),
    location: require('./location'),
    languages: require('./languages'),
    interstitial: require('./interstitial'),
    dependencies: require('./dependencies')
};

module.exports = function(controller, exclude) {
    exclude = exclude || [];
    if (!Array.isArray(exclude)) {
        exclude = [exclude];
    }
    return function execute(params, callback) {
        var promise = asynquence().or(fail);

        for (var middleware in middlewares) {
            if (!_.contains(exclude, middleware)) {
                promise.then(middlewares[middleware].bind(this, params));
            }
        }
        promise.val(controller.bind(this, params, wrapper.bind(this)));

        function fail(err) {
            wrapper.call(this, err);
        }

        function wrapper(err, view, data, json) {
            if (err) {
                return callback(err);
            }
            if (typeof view === 'string') {
                data = data || {};
            }
            else {
                data = view || {};
                view = undefined;
            }
            json = json !== undefined ? json : true;
            data = _.extend(json ? this.dependencies.toJSON() : _.omit(this.dependencies, 'toJSON'), data, {
                seo: Seo.instance(this.app)
            });
            if (!view) {
                callback(err, data);
            }
            else {
                callback(err, view, data);
            }
        }
    };
};
