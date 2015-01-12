'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/staticsearch');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    id: 'items-staticsearch-view',
    className: 'items-staticsearch-view',
    tagName: 'main',
    order: ['parentcategory','pricerange', 'carbrand', 'condition', 'kilometers', 'year', 'bedrooms', 'bathrooms', 'surface', 'state', 'city', 'neighborhood'],
    regexpFindPage: /-p-[0-9]+/,
    regexpReplacePage: /(-p-[0-9]+)/,
    regexpReplaceCategory: /(c-[0-9]+)/,
    regexpFindNeighborhood: /-neighborhood_[0-9_]+/,

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = this.refactorPath(this.app.session.get('path'));

        this.filters = data.filters;
        this.filters.order = this.order;
        _.each(data.items, this.processItem, data);

        return _.extend({}, data, {
            nav: {
                link: link
            }
        });
    },
    cleanPage: function(path) {
        if (path.match(this.regexpFindPage)) {
            path = path.replace(this.regexpReplacePage, '');
        }
        return path.replace(/\/\//g, '/');
    },
    refactorPath: function(path) {
        path = this.cleanPage(path);
        path = path.replace(this.regexpFindNeighborhood, '');
        if (path.slice(path.length - 1) === '/') {
            path = path.substring(0, path.length - 1);
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
