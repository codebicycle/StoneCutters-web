'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var config = require('../../../shared/config');
var Adapter = require('../../../shared/adapters/base');

Backbone.noConflict();

function initialize(attrs, options) {
    this.app = options.app;
}

function isEnabled() {
    return config.getForMarket(this.app.session.get('location').url, ['abundance', 'enabled'], false);
}

function fetch(done, res) {
    var adapter = new Adapter({});

    adapter.request(this.app.req, {
        method: 'GET',
        url: 'http://autolocation-testing.olx.com/domains/' + this.app.session.get('siteLocation') + '/neighbors'
    }, callback.bind(this));

    function callback(error, response, body) {
        if (error || !body) {
            return done(res);
        }
        try {
            body = JSON.parse(body);
        }
        catch(e) {
            return done(res);
        }
        this.fetchItems(done, res, body);        
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
        if (!err && response && response.items) {
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
