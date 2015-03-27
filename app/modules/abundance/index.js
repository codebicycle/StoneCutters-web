'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var config = require('../../../shared/config');
var statsd = require('../../../shared/statsd')();
var helpers = require('../../helpers');

Backbone.noConflict();

function initialize(attrs, options) {
    this.app = options.app;
}

function isEnabled() {
    return config.getForMarket(this.app.session.get('location').url, ['abundance', 'enabled'], false);
}

function fetch(done, res) {
    helpers.dataAdapter.get(this.app.req, ['/locations/' + this.app.session.get('siteLocation') + '/neighbors'].join(''), callback.bind(this));

    function callback(error, response, body) {
        var type = getListingType(this.app.session.get('currentRoute'));
        var quantity;

        if (error) {
            statsd.increment([this.app.session.get('location').abbreviation, 'dgd', 'abundance', type, 'gollum', 'not_available', this.app.session.get('platform')]);
            return done(res);
        }
        else if (!body || !body.neighbors) {
            statsd.increment([this.app.session.get('location').abbreviation, 'dgd', 'abundance', type, 'gollum', 'not_body', this.app.session.get('platform')]);
            return done(res);
        }
        quantity = body.neighbors.length || 'empty';
        if (body.neighbors.length > 5) {
            quantity = 'enough';
        }
        statsd.increment([this.app.session.get('location').abbreviation, 'dgd', 'abundance', type, 'gollum', 'cities', quantity, this.app.session.get('platform')]);
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
            statsd.increment([this.app.session.get('location').abbreviation, 'dgd', 'abundance', type, 'listing', 'view', this.app.session.get('platform')]);
            statsd.increment([this.app.session.get('location').abbreviation, 'dgd', 'abundance', type, 'listing', 'results', quantity, this.app.session.get('platform')]);
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
