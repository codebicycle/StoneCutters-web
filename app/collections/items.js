'use strict';

var Base = require('../bases/collection');
var _ = require('underscore');
var Item = require('../models/item');
var helpers = require('../helpers');
var Filters = require('../modules/filters');
var Paginator = require('../modules/paginator');
var config = require('../../shared/config');

module.exports = Base.extend({
    model: Item,
    initialize: function() {
        this.filters = new Filters(null, {
            app: this.app,
            path: this.app.session.get('path')
        });
    },
    url: function() {
        var url;

        switch(this.params.item_type) {
            case 'myAds':
                url = '/users/:userId/items';
            break;
            case 'favorites':
                url = '/users/:userId/favorites';
            break;
            case 'static':
                url = '/items/static';
            break;
            default:
                url = '/items';
                if (this.params.relatedAds) {
                    url += '/' + this.params.relatedAds + '/related';
                    delete this.params.relatedAds;
                }
            break;
        }
        return url;
    },
    parse: function(response) {
        if (response) {
            this.meta = response.metadata;
            if (this.meta && this.meta.filters) {
                if (!this.filters) {
                    this.filters = new Filters(null, {
                        app: this.app,
                        path: this.app.session.get('path')
                    });
                }
                this.filters.addAll(this.meta.filters);
            }
            // TODO Borrar
            if (this.meta && response.total) {
                this.meta.total = response.total;
            }
            return response.data;
        }
        console.log('[OLX_DEBUG] Empty item listing response');
        this.meta = {};
        return [];
    },
    paginate: function (url, query, options) {
        var page = options.page;
        var total;

        this.paginator = new Paginator({
            url: url,
            page: query.page,
            pageSize: query.pageSize,
            total: this.meta ? this.meta.total : 0
        }, {
            gallery: options.gallery,
            filters: this.filters
        });
        if (page !== undefined) {
            if (isNaN(page) || page <= 1) {
                return 1;
            }
            total = this.paginator.get('totalPages');
            if (page > total) {
                return total;
            }
        }
    },
    fetch: function(options) {
        options = options || {};

        options.data = options.data || {};
        _.defaults(options.data, this.defaultParams || {});
        this.params = options.data;

        _.extend(this.params, this.filters.smaugize());

        return Base.prototype.fetch.apply(this, arguments);
    },
    addFeaturedAds: function(items) {
        if (items) {
            addFeaturedAdsItems(this, items, {
                position: 'top',
                method: 'unshift'
            });
            addFeaturedAdsItems(this, items, {
                position: 'bottom',
                method: 'push'
            });
        }
    }
});

function addFeaturedAdsItems(items, models, options) {
    var location = items.app.session.get('location');
    var currentRoute = items.app.session.get('currentRoute');
    var section = [currentRoute.controller, currentRoute.action].join('#');
    var position = config.getForMarket(location.url, ['featured', 'section', section, 'quantity', options.position]);
    var item;
    var i;

    if (!position) {
        position = config.getForMarket(location.url, ['featured', 'quantity', options.position], 1);
    }
    for (i = 0; i < position && models.length; i++) {
        item = models.shift();
        item.set('isFeaturedAd', true);
        items[options.method].call(items, item);
    }
}

module.exports.id = 'Items';
