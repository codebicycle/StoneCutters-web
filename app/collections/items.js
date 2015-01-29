'use strict';

var _ = require('underscore');
var Base = require('../bases/collection');
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
    hasImages: function() {
        var has = false;
        var filter;

        if (this.filters && this.filters.has('hasimage')) {
            filter = this.filters.get('hasimage').get('value');
            if (filter && filter.length === 1 && filter[0].id == 'true') {
                has = true;
            }
        }
        return has;
    }
});

module.exports.id = 'Items';
