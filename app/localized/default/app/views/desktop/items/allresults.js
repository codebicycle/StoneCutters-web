'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/allresults');
var _ = require('underscore');
var Filters = require('../../../../../../collections/filters');

module.exports = Base.extend({
    id: 'items-allresults-view',
    className: 'items-allresults-view',
    tagName: 'main',
    order: ['state', 'city'],

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        this.filters = data.filters;
        this.filters.order = this.order;

        return _.extend({}, data, {
            items: data.items,
            nav: {
                link: 'nf/all-results',
                linkig: 'nf/all-results-ig',
                listAct: 'active'
            }
        });
    },
    postRender: function() {
        if (!this.filters) {
            this.filters = new Filters(null, {
                app: this.app,
                path: this.app.session.get('path')
            });
        }
    }
});
