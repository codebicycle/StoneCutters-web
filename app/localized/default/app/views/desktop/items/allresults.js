'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/allresults');
var Filters = require('../../../../../../modules/filters');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'items-allresults-view',
    className: 'items-allresults-view',
    tagName: 'main',
    order: ['state', 'city'],

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var filters = Filters.sort(this.order, data.meta.filters);

        if (!this.filters) {
            this.filters = new Filters(this.app.session.get('path'));
        }

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
    }
});
