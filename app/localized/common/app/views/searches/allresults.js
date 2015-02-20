'use strict';

var _ = require('underscore');
var Base = require('../../bases/view');
var helpers = require('../../../../../helpers');
var breadcrumb = require('../../../../../modules/breadcrumb');

module.exports = Base.extend({
    className: 'searches_allresults_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data),
            filtersEnabled: helpers.features.isEnabled.call(this, 'listingFilters'),
            shopsEnabled: helpers.features.isEnabled.call(this, 'shops')
        });
    }
});

module.exports.id = 'searches/allresults';
