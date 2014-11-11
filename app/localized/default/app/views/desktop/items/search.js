'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/search');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    id: 'items-search-view',
    className: 'items-search-view',
    tagName: 'main',
    order: ['parentcategory', 'state', 'city'],
    regexpFindPage: /-p-[0-9]+/,
    regexpReplacePage: /(-p-[0-9]+)/,
    regexpReplaceCategory: /([a-zA-Z0-9-]+-cat-[0-9]+)/,
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = this.cleanPage(this.app.session.get('path'));

        this.filters = data.filters;
        this.filters.order = this.order;

        return _.extend({}, data, {
            items: data.items,
            nav: {
                link: link,
                linkig: helpers.common.linkig.call(this, link, null, 'searchig'),
                listAct: 'active',
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
