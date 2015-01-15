'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/allresults');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    className: 'items_allresults_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = 'nf/all-results';

        return _.extend({}, data, {
            nav: {
                linkig: helpers.common.linkig.call(this, link, null, 'allresultsig'),
                current: 'show'
            }
        });
    }
});
