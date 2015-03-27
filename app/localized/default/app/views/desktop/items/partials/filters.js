'use strict';

var _ = require('underscore');
var Base = require('../../../../../../common/app/bases/view');
var helpers = require('../../../../../../../helpers');
var Categories = require('../../../../../../../collections/categories');
var Filters = require('../../../../../../../modules/filters');
var Metric = require('../../../../../../../modules/metric');

module.exports = Base.extend({
    className: 'listing-filters',
    id: 'listing-filters',
    events: {
        'click [data-increment]': Metric.incrementEventHandler,
        'click [data-increment-filter]': 'onClickFilter',
        'click .filter-title': 'toogleFilter',
        'click .clean-filters': 'cleanFilters',
        'click .check-box input': 'selectFilter',
        'click .range-submit': 'rangeFilterInputs',
        'click .link-range': 'rangeFilterLinks',
        'click .filter-category li a': 'categoryFilter',
        'click .filter-subcategory li a': 'subcategoryFilter',
        'keydown .range input': 'onlyNumbers'
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

        var path = this.getPath('path');
        var $target = $(event.currentTarget);
        var filter = {
            name: $target.data('filter-name'),
            type: $target.data('filter-type')
        };

        this.filters.remove(filter);
        path = [path.split('/-').shift(), '/', this.filters.format()].join('');
        path = this.cleanPath(path);
        path = helpers.common.link(path, this.app);
        this.app.router.redirectTo(path);
    },
    cleanPath: function(path) {
        path = this.refactorPath(path);
        return path;
    },
    refactorPath: function(path) {
        path = this.cleanPage(path);
        if (path.slice(path.length - 1) === '/') {
            path = path.substring(0, path.length - 1);
        }
        return path;
    },
    cleanPage: function(path) {
        if (path.match(this.regexpFindPage)) {
            path = path.replace(this.regexpReplacePage, '');
        }
        return path.replace(/\/\//g, '/');
    },
    selectFilter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = this.getPath('path');
        var $target = $(event.currentTarget);
        var filter = {
            name: $target.data('filter-name'),
            type: $target.data('filter-type'),
            value: $target.val()
        };

        if ($target.is(':checked') && !this.filters.has(filter.name, filter.value)) {
            this.filters.add(filter);
        }
        else {
            this.filters.remove(filter);
        }

        path = [path.split('/-').shift(), '/', this.filters.format()].join('');
        path = this.refactorPath(path);
        path = helpers.common.link(path, this.app);
        this.app.router.redirectTo(path);
    },
    rangeFilterInputs: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = this.getPath('path');
        var $target = $(event.currentTarget);
        var $from = $target.siblings('[data-filter-id=from]');
        var $to = $target.siblings('[data-filter-id=to]');
        var valueFrom = $from.val();
        var valueTo = $to.val();

        if (valueFrom && valueTo && Number(valueFrom) > Number(valueTo)) {
            var tempValueTo = valueTo;

            valueTo = valueFrom;
            valueFrom = tempValueTo;
        }

        if ($target.data('filter-name') === 'age' && Number(valueFrom) < 18) {
            valueFrom = 18;
            if (Number(valueTo) < 18) {
                valueTo = 18;
            }
        }

        var filter = {
            name: $target.data('filter-name'),
            type: $target.data('filter-type'),
            value: {
                from: valueFrom || $from.data('filter-value') || '',
                to: valueTo || $to.data('filter-value') || ''
            }
        };

        this.filters.add(filter);
        path = [path.split('/-').shift(), '/', this.filters.format()].join('');
        path = this.refactorPath(path);
        path = helpers.common.link(path, this.app);
        this.app.router.redirectTo(path);
    },
    rangeFilterLinks: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = this.getPath('path');
        var $target = $(event.currentTarget);
        var filter = {
            name: $target.data('filter-name'),
            type: $target.data('filter-type'),
            value: {
                from: $target.data('filter-from'),
                to: $target.data('filter-to')
            }
        };

        this.filters.add(filter);
        path = [path.split('/-').shift(), '/', this.filters.format()].join('');
        path = this.refactorPath(path);
        path = helpers.common.link(path, this.app);
        this.app.router.redirectTo(path);
    },
    categoryFilter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target = $(event.currentTarget);
        var filterSlug = $target.data('filter-slug');
        var path;

        if (!filterSlug) {
            filterSlug  = ['/des-cat-', $target.data('filter-id'), '/'].join('');
        }

        path = this.replacePath(filterSlug);
        path = this.refactorPath(path);
        this.app.router.redirectTo(path);
    },
    subcategoryFilter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target = $(event.currentTarget);
        var filterSlug = $target.data('filter-slug');
        var currentSlug;
        var categories;
        var category;
        var filterId;
        var path;

        if (!filterSlug) {
            filterId = $target.data('filter-id');
            categories = this.getCategories();

            category = categories.search(filterId);
            if (!category) {
                category = categories.get(filterId);
                if (!category) {
                    return;
                }
            }
            filterSlug = helpers.common.slugToUrl(category.toJSON());
            currentSlug = this.app.session.get('path').split('/').slice(2).shift();
        }

        path = this.replacePath(filterSlug, currentSlug);
        path = this.refactorPath(path);
        this.app.router.redirectTo(path);
    },
    onlyNumbers: function(event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 || (event.keyCode == 65 && event.ctrlKey === true) || (event.keyCode >= 35 && event.keyCode <= 39)) {
            return;
        }
        if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
            event.preventDefault();
        }
    },
    replacePath: function(replace, currentPath) {
        var path = this.app.session.get('path');
        var currentRoute = this.app.session.get('currentRoute');
        var url;

        if (currentRoute.action === 'statics') {
            url = ['/nf', replace];
            url.push(path.replace('/q/', '').split('/').shift());
            return url.join('');
        }
        return path.replace(currentPath || '/search/', replace);
    },
    getPath: function() {
        var path = this.app.session.get('path');
        var currentRoute = this.app.session.get('currentRoute');
        var category;

        if (currentRoute.action === 'statics') {
            path = path.replace('/q/', '/nf/search/');
            if (path.match(/\/c-[0-9]+/)) {
                category = path.replace(/.*\/(c-[0-9]+).*/, '$1');
                path = path.replace(/\/(c-[0-9]+)/, '');
                path = path.replace('/search/', '/des-cat' + category.substring(1) + '/');
            }
        }
        return path;
    },
    onClickFilter: function(event) {
        var $filter = $(event.currentTarget);
        var name = $filter.data('increment-filter');

        if (!this.metric) {
            this.metric = new Metric({}, this);
        }
        this.metric.increment(['dgd', 'filters', [this.metric.getListingType(), name]]);
    },
    getCategories: function() {
        this.categories = this.categories || (this.options.categories && this.options.categories.toJSON ? this.options.categories : new Categories(this.options.categories || {}, {
            app: this.app
        }));
        return this.categories;
    }
});

module.exports.id = 'items/partials/filters';
