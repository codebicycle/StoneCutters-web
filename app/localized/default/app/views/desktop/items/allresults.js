'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'items-allresults-view',
    className: 'items-allresults-view',
    tagName: 'main',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        data.tabNav = {galeryLink: 'nf/all-results-ig', listLink: 'nf/all-results', listAct: 'active'};

        _.each(data.items, this.processItem);
        return _.extend({}, data, {
            items: data.items
        });
    },
    processItem: function(item) {
        item.date.since = helpers.timeAgo(item.date);
    }
});

module.exports.id = 'items/allresults';
