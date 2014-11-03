'use strict';

var Base = require('../bases/collection');
var _ = require('underscore');
var Item = require('../models/item');
var helpers = require('../helpers');
var Filters = require('./filters');
var Paginator = require('../modules/paginator');

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
            case 'adsList':
                url = '/items';
            break;
            case 'myAds':
                url = '/users/:userId/items';
            break;
            case 'favorites':
                url = '/users/:userId/favorites';
            break;
            case 'staticSearch':
                url = '/items/static';
            break;
            default:
                url = '/items';
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
            return response.data;
        }
        console.log('[OLX_DEBUG] Empty item listing response');
        this.meta = {};
        return [];
    },
    paginate: function (url, query, options) {
        var page = options.page;

        Paginator.paginate(this.meta, query, url, {
            gallery: options.gallery,
            filters: this.filters
        });
        if (page !== undefined) {
            if (isNaN(page) || page <= 1) {
                return 1;
            }
            if (page > this.meta.totalPages) {
                return this.meta.totalPages;
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
    }
});

module.exports.id = 'Items';
