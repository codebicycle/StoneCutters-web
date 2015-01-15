'use strict';

var Base = require('../bases/collection');
var _ = require('underscore');
var Shop = require('../models/shop');
var helpers = require('../helpers');

module.exports = Base.extend({
    model: Shop,
    initialize: function() {
    },
    url: function() {
        return "/shops/get";
    },
    parse: function(response) {
        if (response) {
            this.meta = response.metadata;
            
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
    },
    fetch: function(options) {
        options = options || {};

        options.data = options.data || {};
        _.defaults(options.data, this.defaultParams || {});
        this.params = options.data;

        _.extend(this.params, {});
        return Base.prototype.fetch.apply(this, arguments);
    }
});

module.exports.id = 'Shops';
