'use strict';

var _ = require('underscore');
var Base = require('../../../../../../common/app/bases/view');
var helpers = require('../../../../../../../helpers');
var Filters = require('../../../../../../../modules/filters');
var Metric = require('../../../../../../../modules/metric');

module.exports = Base.extend({
    className: 'listing-tabs',
    id: 'listing-tabs',
    tagName: 'nav',
    events: {
        'change #order-by-select': 'sortFilter',
        'click [data-increment-metric]': Metric.incrementEventHandler
    },
    postRender: function() {
        if (!this.filters) {
            this.filters = new Filters(null, {
                app: this.app,
                path: this.app.session.get('path')
            });
        }
    },
    sortFilter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = this.getPath();
        var $target = $(event.currentTarget);
        var filter = {
            name: 'sort',
            type: 'SELECT'
        };

        this.filters.remove(filter);
        filter.value = $target.val();
        this.filters.add(filter);
        path = [path.split('/-').shift(), '/', this.filters.format()].join('');
        path = this.refactorPath(path);
        path = helpers.common.link(path, this.app);
        this.metricSort(filter.value);
        this.app.router.redirectTo(path);
    },
    refactorPath: function(path) {
        if (path.slice(path.length - 1) === '/') {
            path = path.substring(0, path.length - 1);
        }
        return path;
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
    metricSort: function(name) {
        if (!this.metric) {
            this.metric = new Metric({}, this);
        }
        this.metric.increment(['dgd', 'sort', [this.metric.getListingType(), name]]);
    }
});

module.exports.id = 'items/partials/itemlistingtabs';
