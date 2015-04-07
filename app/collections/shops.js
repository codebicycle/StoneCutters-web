'use strict';

var _ = require('underscore');
var Base = require('../bases/collection');
var Shop = require('../models/shop');
var helpers = require('../helpers');
var config = require('../../shared/config');
var HOST = config.get(['mario', 'host'], 'mario-LB-69977862.us-east-1.elb.amazonaws.com');

module.exports = Base.extend({
    model: Shop,
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
    fetch: function(options) {
        options = options || {};

        options.data = options.data || {};
        _.defaults(options.data, this.defaultParams || {});
        this.params = options.data;

        _.extend(this.params, {});
        arguments[0].host = HOST;
        return Base.prototype.fetch.apply(this, arguments);
    }
});

module.exports.id = 'Shops';
