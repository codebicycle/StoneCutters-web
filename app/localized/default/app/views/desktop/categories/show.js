'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('categories/show');
var helpers = require('../../../../../../helpers');
var Filters = require('../../../../../../modules/filters');
var _ = require('underscore');

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
        var link = this.app.session.get('path');
        var linkig = link + '-ig/';
        var filters = Filters.sort(this.order, data.metadata.filters);
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location');
        var showAdSenseListingBottom = helpers.features.isEnabled.call(this, 'adSenseListingBottom', platform, location.url);
        var showAdSenseListingTop = helpers.features.isEnabled.call(this, 'adSenseListingTop', platform, location.url);

        if (~link.indexOf('/-')) {
            linkig = link.replace('/-', '-ig/-');
        }
        if (!this.filters) {
            this.filters = new Filters(link);
        }

        return _.extend({}, data, {
            items: data.items,
            filters: filters,
            wFilters: this.filters,
            showAdSenseListingBottom: showAdSenseListingBottom,
            showAdSenseListingTop: showAdSenseListingTop,
            nav: {
                link: link,
                linkig: linkig,
                listAct: 'active'
            }
        });
    },
    postRender: function() {

        if (!this.filters) {
            this.filters = new Filters(this.app.session.get('path'));
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
            this.filters.set(filter);
        }
        else {
            this.filters.remove(filter);
        }

        path = [path.split('/-').shift(), '/', this.filters.format()].join('');
        path = this.cleanPath(path);
        path = helpers.common.link(path, this.app);
        this.app.router.redirectTo(path);
    },
    rangeFilterInputs: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = this.app.session.get('path');
        var $target = $(event.currentTarget);
        var filter = {
            name: $target.data('filter-name'),
            type: $target.data('filter-type'),
            value: {
                from: $target.siblings('[data-filter-id=from]').val(),
                to: $target.siblings('[data-filter-id=to]').val()
            }
        };

        this.filters.set(filter);
        path = [path.split('/-').shift(), '/', this.filters.format()].join('');
        path = this.cleanPath(path);
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

        this.filters.set(filter);
        path = [path.split('/-').shift(), '/', this.filters.format()].join('');
        path = this.cleanPath(path);
        path = helpers.common.link(path, this.app);
        this.app.router.redirectTo(path);
    },
    cleanPath: function(path) {
        if (path.match(this.regexpFindPage)) {
            path = path.replace(this.regexpReplacePage, '');
        }
        if (path.slice(path.length - 1) === '/') {
            path = path.substring(0, path.length - 1);
        }
        return path;
    }
});
