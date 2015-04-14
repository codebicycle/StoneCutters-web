'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var middlewares = {
    environment: require('./environment'),
    redirections: require('./redirections'),
    location: require('./location'),
    languages: require('./languages'),
    interstitial: require('./interstitial'),
    dependencies: require('./dependencies'),
    search: require('./search'),
    metrics: require('./metrics'),
    conversations: require('./conversations'),
    sixpack: require('./sixpack')
};

module.exports = function(controller, exclude) {
    exclude = exclude || [];
    if (!Array.isArray(exclude)) {
        exclude = [exclude];
    }
    return function execute(params, callback) {
        var promise = asynquence().or(fail);
        var middleware;

        this.include = [];
        for (middleware in middlewares) {
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

            if (this.app.tracking) {
                this.app.tracking.generate(onTrackData.bind(this));
            }
            else {
                onTrackData.call(this, {});
            }

            function onTrackData(trackingData) {
                data = _.extend(json ? this.dependencies.toJSON() : _.omit(this.dependencies, 'toJSON'), data, {
                    include: this.include.concat((data || {}).include || []),
                    seo: this.app.seo,
                    tracking: trackingData
                });
                if (this.app.tracking) {
                    this.app.tracking.clear();
                    this.app.tracking = null;
                }
                if (!view) {
                    callback(err, data);
                }
                else {
                    callback(err, view, data);
                }
            }
        }
    };
};
