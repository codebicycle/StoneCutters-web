'use strict';

var helpers = require('../helpers');

module.exports = {
    index: function(params, callback) {
        var app = helpers.environment.init(this.app);
        var category = app.getSession('categories')._byId[params.id];

        callback(null, {
            'category': category,
            'params': params
        });
    },
    show: function(params, callback) {
        var app = helpers.environment.init(this.app);
        var category;

        params.id = params.catId;
        delete params.catId;
        delete params.title;

        category = app.getSession('categories')._byId[params.id];

        callback(null, {
            'category': category,
            'params': params
        });
    }
};
