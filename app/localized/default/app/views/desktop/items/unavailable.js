'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/unavailable');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var asynquence = require('asynquence');

module.exports = Base.extend({
	tagName: 'aside',
    className: 'items_unavailable_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        data.category_name = this.options.category_name;

        _.each(data.relatedItems, this.processItem);
        return _.extend({}, data, {
            items: data.relatedItems,
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

module.exports.id = 'items/unavailable';
