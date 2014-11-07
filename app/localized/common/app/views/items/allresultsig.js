'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var helpers = require('../../../../../helpers');

module.exports = Base.extend({
    className: 'items_allresultsig_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        _.each(data.items, this.processItem);
        return _.extend({}, data, {
            breadcrumb: helpers.breadcrumb.get.call(this, data)
        });
    },
    processItem: function(item) {
        item.date.since = helpers.timeAgo(item.date);
    }

});

module.exports.id = 'items/allresultsig';