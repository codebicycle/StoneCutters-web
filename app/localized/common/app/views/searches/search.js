'use strict';

var _ = require('underscore');
var Base = require('../../bases/view');
var breadcrumb = require('../../../../../modules/breadcrumb');
var helpers = require('../../../../../helpers');

module.exports = Base.extend({
    className: 'searches_search_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data),
            shopsEnabled: helpers.features.isEnabled.call(this, 'shops')
        });
    }
});

module.exports.id = 'searches/search';
