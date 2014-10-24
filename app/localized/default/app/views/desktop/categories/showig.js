'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var filters = require('../../../../../../modules/filters');
var _ = require('underscore');
var order = ['pricerange','carbrand','condition','kilometers','year','bedrooms','bathrooms','surface','state','city'];

module.exports = Base.extend({
    id: 'categories-showig-view',
    className: 'categories-showig-view',
    tagName: 'main',
    events: {
        'click .check-box input': 'selectFilter',
        'click .range-submit': 'rangeFilterInputs',
        'click .link-range': 'rangeFilterLinks',
        'click .clean-filters': 'cleanFilters',
        'click .filter-title': 'toogleFilter'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var linkig = this.app.session.get('path');
        var link = linkig.replace('-ig','');
        var list = filters.orderFilters(order, data.metadata.filters);

        _.each(data.items, this.processItem);

        return _.extend({}, data, {
            items: data.items,
            filters: list,
            nav: {
                link: link,
                linkig: linkig,
                galeryAct: 'active',
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
        $(event.currentTarget).find('.icons').toggleClass('icon-arrow-down');
        $('.' + currentFilter).slideToggle();
    },
    cleanFilters: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var path = window.location.pathname.split('/-')[0];
        this.app.router.redirectTo(path);
    },
    selectFilter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target =  $(event.currentTarget);
        var filterType = $target.data('filter-type');
        var filterName = $target.data('filter-name');
        var filterValue = $target.val();
        var catUrl = window.location.pathname.split('/-')[0];
        var newfilters;
        var path = catUrl + '/';
        var _filters = filters.parse(window.location.pathname);


        if($target.is(':checked')){
            newfilters = filters.add(_filters, {
                name: filterName,
                type: filterType,
                value: filterValue
            });
            path += filters.prepareFilterUrl(newfilters);
        }
        else {
            newfilters = filters.remove(_filters, {
                name: filterName,
                type: filterType,
                value: filterValue
            });
            path += filters.prepareFilterUrl(newfilters);
        }

        path = helpers.common.link(path, this.app);
        this.app.router.redirectTo(path);
    },
    rangeFilterInputs: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target =  $(event.currentTarget);
        var filterType = $target.data('filter-type');
        var filterName = $target.data('filter-name');
        var from = $target.siblings('[data-filter-id=from]').val();
        var to = $target.siblings('[data-filter-id=to]').val();
        var catUrl = window.location.pathname.split('/-')[0];
        var newfilters;
        var path = catUrl + '/';
        var _filters = filters.parse(window.location.pathname);


        newfilters = filters.add(_filters, {
            name: filterName,
            type: filterType,
            value: {
                from: from,
                to: to
            }
        });
        path += filters.prepareFilterUrl(newfilters);
        this.app.router.redirectTo(path);

    },
    rangeFilterLinks: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $target =  $(event.currentTarget);
        var filterType = $target.data('filter-type');
        var filterName = $target.data('filter-name');
        var from = $target.data('filter-from');
        var to = $target.data('filter-to');
        var catUrl = window.location.pathname.split('/-')[0];
        var newfilters;
        var path = catUrl + '/';
        var _filters = filters.parse(window.location.pathname);

        newfilters = filters.add(_filters, {
            name: filterName,
            type: filterType,
            value: {
                from: from,
                to: to
            }
        });
        path += filters.prepareFilterUrl(newfilters);
        this.app.router.redirectTo(path);

    }
});

module.exports.id = 'categories/showig';
