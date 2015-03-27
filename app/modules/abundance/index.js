'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var logger = require('../logger');
var helpers = require('../../helpers');
var Metric = require('../../modules/metric');
var config = require('../../../shared/config');
var statsd = require('../../../shared/statsd')();

Backbone.noConflict();

function initialize(attrs, options) {
    this.app = options.app;
    this.metric = new Metric({}, options);
}

function isEnabled() {
    var location = this.app.session.get('location');
    var enabled = config.getForMarket(location.url, ['abundance', 'enabled'], false);

    if (enabled) {
        enabled = location.current && location.current.type === 'city';
    }
    return enabled;
}

function fetch(done, res) {
    var siteLocation = this.app.session.get('siteLocation');

    helpers.dataAdapter.get(this.app.req, ['/locations/' + siteLocation + '/neighbors'].join(''), callback.bind(this));
    logger.log('[OLX_DEBUG] DGD-2 ::', siteLocation);

    function callback(error, response, body) {
        var type = getListingType(this.app.session.get('currentRoute'));
        var quantity;

        if (error) {
            this.metric.increment(['dgd', 'abundance', [type, 'gollum', 'not_available']]);
            return done(res);
        }
        else if (!body || !body.neighbors) {
            this.metric.increment([ 'dgd', 'abundance', [type, 'gollum', 'not_body']]);
            return done(res);
        }
        quantity = body.neighbors.length || 'empty';
        if (body.neighbors.length > 5) {
            quantity = 'enough';
        }
        this.metric.increment(['dgd', 'abundance', [type, 'gollum', 'cities', quantity]]);
        this.fetchItems(done, res, body.neighbors);
    }
}

function fetchItems(done, res, neighbors) {
    this.app.fetch({
        items: {
            collection: 'Items',
            params: _.extend({}, this.get('params'), {
                city: neighbors.join(' OR '),
                location: this.app.session.get('location').url,
                pageSize: config.getForMarket(this.app.session.get('location').url, ['abundance', 'quantity'], 25)
            })
        }
    }, {
        readFromCache: false
    }, callback.bind(this));
    
    function callback(err, response) {
        var quantity;
        var type;

        if (!err && response && response.items) {
            res.items.meta.abundance = {
                total: response.items.meta.total,
                around: true,
                data: response.items.toJSON()
            };
            quantity = 'empty';
            if (response.items.meta.total) {
                quantity = 'enough';
                if (response.items.meta.total <= 10) {
                    quantity = 10;
                }
                else if (response.items.meta.total <= 50) {
                    quantity = 50;
                }
                else if (response.items.meta.total <= 100) {
                    quantity = 100;
                }
            }
            type = getListingType(this.app.session.get('currentRoute'));
            this.metric.increment(['dgd', 'abundance', [type, 'listing', 'view']]);
            this.metric.increment(['dgd', 'abundance', [type, 'listing', 'results', quantity]]);
        }
        done(res);
    }
}

function getListingType(currentRoute) {
    var type = 'browse';
    if (currentRoute.controller === 'searches' && _.contains(['filter', 'filterig', 'search', 'searchig'], currentRoute.action)) {
        type = 'search';
    }
    return type;
}

module.exports = Backbone.Model.extend({
    initialize: initialize,
    isEnabled: isEnabled,
    fetch: fetch,
    fetchItems: fetchItems
});
