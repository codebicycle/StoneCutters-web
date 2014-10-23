'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var filters = require('../../../../../../modules/filters');
var _ = require('underscore');
var order = ['state','city'];

module.exports = Base.extend({
    id: 'items-allresultsig-view',
    className: 'items-allresultsig-view',
    tagName: 'main',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var list = filters.orderFilters(order, data.metadata.filters);

        _.each(data.items, this.processItem);
        return _.extend({}, data, {
            items: data.items,
            filters: list,
            nav: {
                link: 'nf/all-results',
                linkig: 'nf/all-results-ig',
                galeryAct: 'active'
            }
        });
    },
    processItem: function(item) {
        item.date.since = helpers.timeAgo(item.date);
    }
});

module.exports.id = 'items/allresultsig';
