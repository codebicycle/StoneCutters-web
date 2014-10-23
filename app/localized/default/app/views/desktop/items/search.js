'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var filters = require('../../../../../../modules/filters');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'items-search-view',
    className: 'items-search-view',
    tagName: 'main',
    events: {
        'click .sub-categories li a': 'categoryFilter',
        'click .clean-filters': 'cleanFilters',
        'click .filter-title span.icons': 'toogleFilter'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var filters = data.metadata.filters;
        var order = ['parentcategory','state','city'];
        var list = [];

        _.each(order, function(obj, i){
            _.find(filters, function(obj){
                return obj.name == order[i] ? list.push(obj) : false;
            });
        });

        _.each(data.items, this.processItem);
        return _.extend({}, data, {
            items: data.items,
            filters: list,
            nav: {
                link: data.url + '/',
                linkig: data.url + '/-ig',
                listAct: 'active',
            }
        });
    },
    processItem: function(item) {
        item.date.since = helpers.timeAgo(item.date);
    },
    toogleFilter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var currentFilter = $(event.currentTarget).data('filter-name');
        $(event.currentTarget).toggleClass('icon-arrow-top');
        $('.' + currentFilter).slideToggle();
    },
    cleanFilters: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = window.location.pathname.split('/-')[0];
        this.app.router.redirectTo(path);
    },
    categoryFilter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target =  $(event.currentTarget);
        var filterSlug = $target.data('filter-slug');
        var filterName;
        var filterId;
        var path;

        if (!filterSlug) {
            filterId = $target.data('filter-id');
            filterSlug  = ['des', (typeof filterId !== 'undefined' ? '-cat-' : '-iid-'), filterId].join('');
        }

        path = window.location.pathname.replace('search', filterSlug);

        this.app.router.redirectTo(path);

    }
});

module.exports.id = 'items/search';
