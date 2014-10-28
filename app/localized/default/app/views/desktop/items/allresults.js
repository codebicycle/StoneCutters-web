'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var Filters = require('../../../../../../modules/filters');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'items-allresults-view',
    className: 'items-allresults-view',
    tagName: 'main',
    order: ['state','city'],

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var filters = Filters.sort(this.order, data.metadata.filters);

        if (!this.filters) {
            this.filters = new Filters(this.app.session.get('path'));
        }
        _.each(data.items, this.processItem);

        return _.extend({}, data, {
            items: data.items,
            filters: filters,
            wFilters: this.filters,
            nav: {
                link: 'nf/all-results',
                linkig: 'nf/all-results-ig',
                listAct: 'active'
            }
        });
    },
    postRender: function() {
        if (!this.filters) {
            this.filters = new Filters(this.app.session.get('path'));
        }
    },
    processItem: function(item) {
        item.date.since = helpers.timeAgo(item.date);
    }
});

module.exports.id = 'items/allresults';
