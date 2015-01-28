'use strict';

var _ = require('underscore');
var Base = require('./items');
var config = require('../../shared/config');

module.exports = Base.extend({
    fetch: function(options) {
        var currentRoute = this.app.session.get('currentRoute');
        var section = [currentRoute.controller, currentRoute.action].join('#');
        var location = this.app.session.get('location');
        var paramsDefault = config.getForMarket(location.url, ['featured', 'params'], {});
        var params = config.getForMarket(location.url, ['featured', 'section', section, 'params'], {});
        var pageSize = config.getForMarket(location.url, ['featured', 'section', section, 'quantity', 'total']);

        options = options || {};

        options.data = options.data || {};
        _.defaults(options.data, this.defaultParams || {});
        this.params = options.data;

        _.extend(this.params, paramsDefault, params, {
            pageSize: pageSize || config.getForMarket(location.url, ['featured', 'quantity', 'total'], 2)
        });

        return Base.prototype.fetch.apply(this, arguments);
    },
    mergeTo: function(items) {
        if (items) {
            this.addFeatures(items, 'top', 'unshift');
            this.addFeatures(items, 'bottom', 'push');
        }
    },
    addFeatures: function(items, position, method) {
        var currentRoute = this.app.session.get('currentRoute');
        var section = [currentRoute.controller, currentRoute.action].join('#');
        var location = this.app.session.get('location');
        var max = config.getForMarket(location.url, ['featured', 'section', section, 'quantity', position]);
        var item;
        var i;

        if (!max) {
            max = config.getForMarket(location.url, ['featured', 'quantity', position], 1);
        }
        for (i = 0; i < max && this.length; i++) {
            item = this.shift();
            item.set('isFeatured', true);
            items[method].call(items, item);
        }
    }
});

module.exports.id = 'FeatureAds';
