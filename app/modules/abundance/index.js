'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var config = require('../../../shared/config');
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
        if (error || !body || !body.neighbors) {
            return done(res);
        }
        this.fetchItems(done, res, body.neighbors);
    }
}

function fetchItems(done, res, neighbors) {
    this.app.fetch({
        items: {
            collection: 'Items',
            params: _.extend({}, this.get('params'), {
                city: neighbors.join(' OR '),
                location: this.app.session.get('location').url
            })
        }
    }, {
        readFromCache: false
    }, callback);
    
    function callback(err, response) {
        if (!err && response && response.items && response.items.length > 10) {
            res.items.meta.abundance = {
                total: response.items.length,
                around: true,
                data: response.items.toJSON()
            };
        }
        done(res);
    }
}

module.exports = Backbone.Model.extend({
    initialize: initialize,
    isEnabled: isEnabled,
    fetch: fetch,
    fetchItems: fetchItems
});
