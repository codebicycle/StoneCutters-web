'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/filter');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

var tracking = require('../../../../../../modules/tracking');
var Filters = require('../../../../../../modules/filters');

module.exports = Base.extend({
    order: ['pricerange', 'hasimage', 'state', 'parentcategory'],
    regexpFindPage: /-p-[0-9]+/,
    regexpReplacePage: /(-p-[0-9]+)/,
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        this.filters = data.filters;
        this.filters.order = this.order;
        data.path = data.path.replace('/', '');
        return _.extend({}, data, {});
    },
    postRender: function() {
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
        if (!this.filters) {
            this.filters = new Filters(null, {
                app: this.app,
                path: this.app.session.get('path')
            });
        }
        this.attachTrackMe();
    },
    events: {
        'click .check-box': 'selectFilter',
        'click .adType': 'adType',
        'click .clear-all': 'cleanFilters',
        'click .range-submit': 'rangeFilterInputs',
        'click .category': 'categoryFilter',
        'click .title': 'toogleFilter'
    },
    onStart: function(event) {
        this.appView.trigger('filter:start');
    },
    onEnd: function(event) {
        this.appView.trigger('filter:end');
    },
    toogleFilter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $this = $(event.currentTarget);

        $this.toggleClass('active');
        $this.closest('.filter').find('.dropdown').slideToggle();
    },
    adType: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = this.app.session.get('path');
        var $this = $(event.currentTarget);
        var filter = {
            name: $this.closest('.filter').data('filter-name'),
            type: $this.closest('.filter').data('filter-type'),
            value: $this.data('filter-value')
        };

        if (filter.value && !this.filters.has(filter.name, filter.value)) {
            this.filters.add(filter);
        } else {
            this.filters.remove(filter);
        }

        path = [this.cleanPath(path), '/', this.filters.format()].join('');
        path = helpers.common.link(path, this.app);
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
        path = [this.cleanPath(path), '/', this.filters.format()].join('');
        path = helpers.common.link(path, this.app);
        this.app.router.redirectTo(path);
    },
    selectFilter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = this.app.session.get('path');
        var $this = $(event.currentTarget);
        var val = $this.find('input').val();

        var filter = {
            name: $this.closest('.filter').data('filter-name'),
            type: $this.closest('.filter').data('filter-type'),
            value: val
        };

        $this.find('input').attr('checked', true);

        if ($this.find('input').is(':checked') && !this.filters.has(filter.name, filter.value)) {
            this.filters.add(filter);
        } else {
            this.filters.remove(filter);
        }

        if (this.filters.has('carmodel') && !this.filters.has('carbrand')) {
            filter = {
                name: 'carmodel',
                type: 'SELECT'
            };
            this.filters.remove(filter);
        }

        path = [this.cleanPath(path), '/', this.filters.format()].join('');
        path = helpers.common.link(path, this.app);
        this.app.router.redirectTo(path);
    },
    rangeFilterInputs: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = this.app.session.get('path');
        var $this = $(event.currentTarget);

        var from = $this.closest('.filter').find('[data-filter-id=from]').val();
        var to = $this.closest('.filter').find('[data-filter-id=to]').val();

        var filter = {
            name: $this.closest('.filter').data('filter-name'),
            type: $this.closest('.filter').data('filter-type'),
            value: {
                from: from,
                to: to
            }
        };

        if (!from && !to) {
            return this.filters.remove(filter);
        }

        this.filters.add(filter);
        path = [this.cleanPath(path), '/', this.filters.format()].join('');
        path = helpers.common.link(path, this.app);
        this.app.router.redirectTo(path);
    },
    cleanFilters: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = this.app.session.get('path');
        var $target = $(event.currentTarget);

        var filter = {
            name: $target.closest('.filter').data('filter-name'),
            type: $target.closest('.filter').data('filter-type')
        };

        this.filters.remove(filter);

        if (!this.filters.has('carbrand') && this.filters.has('carmodel')) {
            filter = {
                name: 'carmodel',
                type: 'SELECT'
            };
            this.filters.remove(filter);
        }

        path = [this.cleanPath(path), '/', this.filters.format()].join('');
        path = helpers.common.link(path, this.app);
        this.app.router.redirectTo(path);
    },
    cleanPage: function(path) {
        if (path.match(this.regexpFindPage)) {
            path = path.replace(this.regexpReplacePage, '');
        }
        return path;
    },
    cleanPath: function(path) {
        path = this.refactorPath(path);
        path = path.replace('/filter', '');
        return path.split('/-').shift();
    },
    refactorPath: function(path) {
        path = this.cleanPage(path);
        if (path.slice(path.length - 1) === '/') {
            path = path.substring(0, path.length - 1);
        }
        return path;
    }

});