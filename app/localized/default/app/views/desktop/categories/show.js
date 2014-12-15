'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('categories/show');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    id: 'categories-show-view',
    className: 'categories-show-view',
    tagName: 'main',
    order: ['pricerange', 'carbrand', 'condition', 'kilometers', 'year', 'bedrooms', 'bathrooms', 'surface', 'state', 'city'],
    regexpFindPage: /-p-[0-9]+/,
    regexpReplacePage: /(-p-[0-9]+)/,

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = this.cleanPage(this.app.session.get('path'));

        this.filters = data.filters;
        this.filters.order = this.order;

        return _.extend({}, data, {
            items: data.items,
            nav: {
                link: link,
                linkig: helpers.common.linkig.call(this, link, null, 'showig'),
                listAct: 'active'
            }
        });
    },
    cleanPage: function(path) {
        if (path.match(this.regexpFindPage)) {
            path = path.replace(this.regexpReplacePage, '');
        }
        return path;
    }
});
