'use strict';

var _ = require('underscore');
var Base = require('../../bases/view');
var breadcrumb = require('../../../../../modules/breadcrumb');
var Shops = require('../../../../../modules/shops');

module.exports = Base.extend({
    className: 'pages_comingsoon_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var shops = new Shops(this);

        shops.evaluate({
            shops_experiment_from: 'listing-shop-from-map'
        });      

        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data)
        });
    }
});

module.exports.id = 'pages/comingsoon';
