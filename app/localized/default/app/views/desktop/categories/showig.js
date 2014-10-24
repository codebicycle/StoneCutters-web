'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var Filters = require('../../../../../../modules/filters');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'categories-showig-view',
    className: 'categories-showig-view',
    tagName: 'main',
    order: ['pricerange', 'carbrand', 'condition', 'kilometers', 'year', 'state', 'city'],
    events: {
        'click .check-box input': 'selectFilter',
        'click .range-submit': 'rangeFilterInputs',
        'click .link-range': 'rangeFilterLinks',
        'click .clean-filters': 'cleanFilters',
        'click .filter-title span.icons': 'toogleFilter'
    },

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var linkig = this.app.session.get('path');
        var link = linkig.replace('-ig', '');
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
                linkig: linkig,
                galeryAct: 'active',
                current: 'showig'
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

        $filter.toggleClass('icon-arrow-top');
        $('.' + filterName).slideToggle();
    },
    cleanFilters: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.app.router.redirectTo(this.app.session.get('path').split('/-').shift());
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
        path = helpers.common.link(path, this.app);
        this.app.router.redirectTo(path);
    }
});

module.exports.id = 'categories/showig';
