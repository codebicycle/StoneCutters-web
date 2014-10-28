'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var Filters = require('../../../../../../modules/filters');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'items-search-view',
    className: 'items-search-view',
    tagName: 'main',
    order: ['parentcategory', 'state', 'city'],
    regexpFindPage: /-p-[0-9]+/,
    regexpReplacePage: /(-p-[0-9]+)/,
    regexpReplaceCategory: /([a-zA-Z0-9-]+-cat-[0-9]+)/,
    events: {
        'click .sub-categories li a': 'categoryFilter',
        'click .clean-filters': 'cleanFilters',
        'click .filter-title': 'toogleFilter'
    },

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = this.app.session.get('path');
        var filters = Filters.sort(this.order, data.metadata.filters);

        if (!this.filters) {
            this.filters = new Filters(link);
        }
        _.each(data.items, this.processItem);

        return _.extend({}, data, {
            items: data.items,
            filters: filters,
            wFilters: this.filters,
            nav: {
                link: link,
                linkig: link + '/-ig',
                listAct: 'active',
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
    },
    toogleFilter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $filter = $(event.currentTarget);
        var filterName = $filter.data('filter-name');

        $filter.find('.icons').toggleClass('icon-arrow-top');
        $('.' + filterName).slideToggle();
    },
    cleanFilters: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = this.app.session.get('path').split('/-').shift();

        path = this.cleanPath(path);
        this.app.router.redirectTo(path);
    },
    categoryFilter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = this.app.session.get('path');
        var $target = $(event.currentTarget);
        var filterSlug = $target.data('filter-slug');

        if (!filterSlug) {
            filterSlug  = ['/des-cat-', $target.data('filter-id'), '/'].join('');
        }

        path = path.replace('/search/', filterSlug);
        path = this.refactorPath(path);
        this.app.router.redirectTo(path);
    },
    refactorPath: function(path) {
        if (path.match(this.regexpFindPage)) {
            path = path.replace(this.regexpReplacePage, '');
        }
        if (path.slice(path.length - 1) === '/') {
            path = path.substring(0, path.length - 1);
        }
        return path;
    },
    cleanPath: function(path) {
        path = this.refactorPath(path);
        path = path.replace(this.regexpReplaceCategory, 'search');
        return path;
    }
});

module.exports.id = 'items/search';
