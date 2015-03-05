'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var restler = require('restler');
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

        shops.evaluate('listing_shop_from_map');       

        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data)
        });
    }
});

module.exports.id = 'pages/comingsoon';
