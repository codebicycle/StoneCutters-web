'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/staticsearch');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var Filters = require('../../../../../../collections/filters');

module.exports = Base.extend({
    id: 'items-staticsearch-view',
    className: 'items-staticsearch-view',
    tagName: 'main',
    order: ['parentcategory','state','city'],
    events: {
        'click .sub-categories li a': 'categoryFilter',
        'click .clean-filters': 'cleanFilters',
        'click .filter-title': 'toogleFilter'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = this.app.session.get('path');

        this.filters = data.filters;
        this.filters.order = this.order;
        _.each(data.items, this.processItem);

        return _.extend({}, data, {
            items: data.items,
            nav: {
                link: link,
                listAct: 'active',
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

module.exports.id = 'items/staticsearch';
