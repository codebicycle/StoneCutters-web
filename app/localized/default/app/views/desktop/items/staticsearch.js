'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/staticsearch');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    id: 'items-staticsearch-view',
    className: 'items-staticsearch-view',
    tagName: 'main',
    order: ['parentcategory','state','city'],
    regexpFindPage: /-p-[0-9]+/,
    regexpReplacePage: /(-p-[0-9]+)/,
    regexpReplaceCategory: /(c-[0-9]+)/,
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = this.cleanPage(this.app.session.get('path'));

        this.filters = data.filters;
        this.filters.order = this.order;
        _.each(data.items, this.processItem, data);

        return _.extend({}, data, {
            nav: {
                link: link,
                linkig: helpers.common.linkig.call(this, link, null, 'qig'),
                listAct: 'active'
            }
        });
    },
    cleanPage: function(path) {
        if (path.match(this.regexpFindPage)) {
            path = path.replace(this.regexpReplacePage, '');
        }
        return path;
    },
    processItem: function(item) {
        var regexp = new RegExp(this.search, 'gi');
        var replace = ['<strong>', this.search, '</strong>'].join('');

        item.description = item.description.replace(regexp, replace);
        item.title = item.title.replace(regexp, replace);
    }
});
