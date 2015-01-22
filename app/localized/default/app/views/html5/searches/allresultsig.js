'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('searches/allresults');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    className: 'items_allresults_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = 'nf/all-results';

        return _.extend({}, data, {
            nav: {
                linkig: link,
                current: 'showig'
            },
            filtersEnabled: helpers.features.isEnabled.call(this, 'listingFilters')
        });
    }
});
module.exports.id = 'searches/allresults';