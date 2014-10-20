'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var filters = require('../../../../../../modules/filters');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'categories-show-view',
    className: 'categories-show-view',
    tagName: 'main',
    events: {
        'click .check-box input': 'filterCheckbox',
        'click .clean-filters': 'cleanFilters',
        'click .filter-title span.icons': 'toogleFilter'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var slugUrl = helpers.common.slugToUrl(data.currentCategory);
        var filters = data.metadata.filters;
        var order = ['pricerange','carbrand','condition','kilometers','year'];
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
                link: slugUrl,
                listAct: 'active',
            }
        });
    },
    postRender: function() {

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

        console.log('CLEAN FILTROS');

    },
    filterCheckbox: function(event) {
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
    }
});

module.exports.id = 'categories/show';
