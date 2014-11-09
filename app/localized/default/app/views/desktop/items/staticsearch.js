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
    regexpFindPage: /-p-[0-9]+/,
    regexpReplacePage: /(-p-[0-9]+)/,
    regexpReplaceCategory: /(c-[0-9]+)/,
    events: {
        'click .sub-categories li a': 'categoryFilter',
        'click .clean-filters': 'cleanFilters',
        'click .filter-title': 'toogleFilter'
    },
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

        $filter.find('.icons').toggleClass('icon-arrow-down');
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
        var filterId = $target.data('filter-id');

        path = this.cleanPath(path);
        path = path.replace(/(\/q\/[^\/\s]+)(\/-.+)?/, '$1/c-' + filterId + '$2');
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
        path = path.replace(this.regexpReplaceCategory, '');
        return path;
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
