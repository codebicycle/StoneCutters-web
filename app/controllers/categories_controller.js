'use strict';

var helpers = require('../helpers');

module.exports = {
    index: function(params, callback) {
        helpers.controllers.control(this, params, controller);

        function controller() {
            callback(null, {
                category: this.app.getSession('categories')._byId[params.id]
            });
        }
    },
    show: function(params, callback) {
        helpers.controllers.control(this, params, controller);

        function controller() {
            helpers.seo.resetHead();
            helpers.seo.addMetatag('title', 'Listing');
            helpers.seo.addMetatag('Description', 'This is a listing page');
            params.id = params.catId;
            delete params.catId;
            delete params.title;
            callback(null, {
                category: this.app.getSession('categories')._byId[params.id]
            });
        }
    }
};
