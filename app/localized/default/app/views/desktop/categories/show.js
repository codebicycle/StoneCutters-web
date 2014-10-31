'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('categories/show');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var Filters = require('../../../../../../collections/filters');

module.exports = Base.extend({
    id: 'categories-show-view',
    className: 'categories-show-view',
    tagName: 'main',
    order: ['pricerange', 'carbrand', 'condition', 'kilometers', 'year', 'bedrooms', 'bathrooms', 'surface', 'state', 'city'],
    regexpFindPage: /-p-[0-9]+/,
    regexpReplacePage: /(-p-[0-9]+)/,
    events: {
        'click .check-box input': 'selectFilter',
        'click .range-submit': 'rangeFilterInputs',
        'click .link-range': 'rangeFilterLinks',
        'click .clean-filters': 'cleanFilters',
        'click .filter-title': 'toogleFilter'
    },

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var link = this.cleanPage(this.app.session.get('path'));
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location');
        var showAdSenseListingBottom = helpers.features.isEnabled.call(this, 'adSenseListingBottom', platform, location.url);
        var showAdSenseListingTop = helpers.features.isEnabled.call(this, 'adSenseListingTop', platform, location.url);

        this.filters = data.filters;
        this.filters.order = this.order;

        return _.extend({}, data, {
            items: data.items,
            showAdSenseListingBottom: showAdSenseListingBottom,
            showAdSenseListingTop: showAdSenseListingTop,
            nav: {
                link: link,
                linkig: helpers.common.linkig.call(this, link, null, 'showig'),
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

        $filter.find('.icons').toggleClass('icon-arrow-top');
        $('.' + filterName).slideToggle();
    },
    cleanFilters: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = this.app.session.get('path');
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
    selectFilter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = this.app.session.get('path');
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

        var path = this.app.session.get('path');
        var $target = $(event.currentTarget);
        var $from = $target.siblings('[data-filter-id=from]');
        var $to = $target.siblings('[data-filter-id=to]');
        var filter = {
            name: $target.data('filter-name'),
            type: $target.data('filter-type'),
            value: {
                from: $from.val() || $from.data('filter-value') || '',
                to: $to.val() || $to.data('filter-value') || ''
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

        var path = this.app.session.get('path');
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
    refactorPath: function(path) {
        path = this.cleanPage(path);
        if (path.slice(path.length - 1) === '/') {
            path = path.substring(0, path.length - 1);
        }
        return path;
    },
    cleanPath: function(path) {
        path = this.refactorPath(path);
        return path;
    },
    cleanPage: function(path) {
        if (path.match(this.regexpFindPage)) {
            path = path.replace(this.regexpReplacePage, '');
        }
        return path;
    }
});
